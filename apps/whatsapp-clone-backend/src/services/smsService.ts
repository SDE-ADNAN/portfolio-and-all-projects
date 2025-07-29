import twilio from 'twilio';
import { PrismaClient } from '@prisma/client';
import logger from '@/config/logger';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Initialize Twilio client only if credentials are provided
let twilioClient: any = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  } catch (error) {
    logger.warn('Twilio client initialization failed:', error);
  }
}

class SMSService {
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async createVerificationRecord(
    userId: string,
    phone: string,
    code: string
  ) {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Get user email from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.verificationToken.create({
      data: {
        email: user.email,
        token: code,
        type: 'phone',
        expiresAt,
      },
    });
  }

  async sendVerificationSMS(userId: string, phone: string): Promise<boolean> {
    try {
      const code = this.generateVerificationCode();
      
      // Create verification record
      await this.createVerificationRecord(userId, phone, code);
      
      // Send SMS only if Twilio client is available
      if (twilioClient) {
        await twilioClient.messages.create({
          body: `Your WhatsApp Clone verification code is: ${code}. This code will expire in 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
        logger.info(`Verification SMS sent to ${phone}`);
      } else {
        logger.warn('Twilio client not available, SMS not sent. Code:', code);
      }

      return true;
    } catch (error) {
      logger.error('Error sending verification SMS:', error);
      return false;
    }
  }

  async verifyPhoneCode(userId: string, code: string): Promise<boolean> {
    try {
      // Get user email from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });

      if (!user) {
        return false;
      }

      const verificationRecord = await prisma.verificationToken.findFirst({
        where: {
          email: user.email,
          token: code,
          type: 'phone',
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!verificationRecord) {
        return false;
      }

      // Update user as verified
      await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });

      // Delete verification record
      await prisma.verificationToken.delete({
        where: { id: verificationRecord.id },
      });

      logger.info(`Phone verified for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error verifying phone code:', error);
      return false;
    }
  }

  async resendVerificationSMS(userId: string, phone: string): Promise<boolean> {
    try {
      // Get user email from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });

      if (!user) {
        return false;
      }

      // Delete any existing verification records for this user
      await prisma.verificationToken.deleteMany({
        where: {
          email: user.email,
          type: 'phone',
        },
      });

      // Send new verification SMS
      return await this.sendVerificationSMS(userId, phone);
    } catch (error) {
      logger.error('Error resending verification SMS:', error);
      return false;
    }
  }
}

export default new SMSService(); 