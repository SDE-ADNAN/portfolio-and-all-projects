import sgMail from '@sendgrid/mail';
import { PrismaClient } from '@prisma/client';
import logger from '@/config/logger';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async createVerificationRecord(
    userId: string,
    type: 'email' | 'phone',
    token: string
  ) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: userId,
        token,
        type,
        expiresAt,
      },
    });
  }

  private getEmailTemplate(type: 'verification' | 'password-reset', data: any): EmailTemplate {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    switch (type) {
      case 'verification':
        return {
          subject: 'Verify your WhatsApp Clone account',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #25D366;">Welcome to WhatsApp Clone!</h2>
              <p>Hi ${data.username},</p>
              <p>Please verify your email address by clicking the button below:</p>
              <a href="${baseUrl}/verify-email?token=${data.token}" 
                 style="background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
              </a>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
          `,
          text: `
            Welcome to WhatsApp Clone!
            
            Hi ${data.username},
            
            Please verify your email address by visiting this link:
            ${baseUrl}/verify-email?token=${data.token}
            
            This link will expire in 24 hours.
            
            If you didn't create an account, you can safely ignore this email.
          `
        };

      case 'password-reset':
        return {
          subject: 'Reset your WhatsApp Clone password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #25D366;">Password Reset Request</h2>
              <p>Hi ${data.username},</p>
              <p>You requested to reset your password. Click the button below to create a new password:</p>
              <a href="${baseUrl}/reset-password?token=${data.token}" 
                 style="background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
          text: `
            Password Reset Request
            
            Hi ${data.username},
            
            You requested to reset your password. Visit this link to create a new password:
            ${baseUrl}/reset-password?token=${data.token}
            
            This link will expire in 1 hour.
            
            If you didn't request this, you can safely ignore this email.
          `
        };

      default:
        throw new Error('Invalid email template type');
    }
  }

  async sendVerificationEmail(userId: string, email: string, username: string): Promise<boolean> {
    try {
      const token = this.generateVerificationToken();
      
      // Create verification record
      await this.createVerificationRecord(userId, 'email', token);
      
      // Get email template
      const template = this.getEmailTemplate('verification', { username, token });
      
      // Send email
      await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@whatsappclone.com',
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      logger.info(`Verification email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Error sending verification email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(userId: string, email: string, username: string): Promise<boolean> {
    try {
      const token = this.generateVerificationToken();
      
      // Create verification record with shorter expiration
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await prisma.verificationToken.create({
        data: {
          identifier: userId,
          token,
          type: 'password-reset',
          expiresAt,
        },
      });
      
      // Get email template
      const template = this.getEmailTemplate('password-reset', { username, token });
      
      // Send email
      await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@whatsappclone.com',
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      logger.info(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      return false;
    }
  }

  async verifyEmailToken(token: string): Promise<{ success: boolean; userId?: string }> {
    try {
      const verificationRecord = await prisma.verificationToken.findFirst({
        where: {
          token,
          type: 'email',
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!verificationRecord) {
        return { success: false };
      }

      // Update user as verified
      await prisma.user.update({
        where: { id: verificationRecord.identifier },
        data: { emailVerified: true },
      });

      // Delete verification record
      await prisma.verificationToken.delete({
        where: { id: verificationRecord.id },
      });

      logger.info(`Email verified for user ${verificationRecord.identifier}`);
      return { success: true, userId: verificationRecord.identifier };
    } catch (error) {
      logger.error('Error verifying email token:', error);
      return { success: false };
    }
  }

  async verifyPasswordResetToken(token: string): Promise<{ success: boolean; userId?: string }> {
    try {
      const verificationRecord = await prisma.verificationToken.findFirst({
        where: {
          token,
          type: 'password-reset',
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!verificationRecord) {
        return { success: false };
      }

      return { success: true, userId: verificationRecord.identifier };
    } catch (error) {
      logger.error('Error verifying password reset token:', error);
      return { success: false };
    }
  }

  async invalidatePasswordResetToken(token: string): Promise<void> {
    try {
      await prisma.verificationToken.deleteMany({
        where: {
          token,
          type: 'password-reset',
        },
      });
    } catch (error) {
      logger.error('Error invalidating password reset token:', error);
    }
  }
}

export default new EmailService(); 