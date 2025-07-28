'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  email,
}) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const handleVerify = async () => {
    if (!token.trim()) {
      setError('Please enter the verification token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(data.error?.message || 'Verification failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ type: 'email' }),
      });

      const data = await response.json();

      if (data.success) {
        setError('');
        alert('Verification email sent successfully!');
      } else {
        setError(data.error?.message || 'Failed to resend verification email');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600">
            We sent a verification link to <strong>{email}</strong>
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Email Verified!
            </h3>
            <p className="text-gray-600">
              Your email has been successfully verified.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Token
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter verification token"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleVerify}
                disabled={loading}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={handleResend}
                disabled={loading}
                className="text-green-600 hover:text-green-700 text-sm focus:outline-none disabled:opacity-50"
              >
                Didn&apos;t receive the email? Resend
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationModal; 