'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import EmailVerificationModal from './EmailVerificationModal';
import PhoneVerificationModal from './PhoneVerificationModal';
import PasswordResetModal from './PasswordResetModal';

const AuthInterface: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        const result = await register(formData.email, formData.password, formData.username, formData.phone);
        if (result?.success && !result.user?.emailVerified) {
          setShowEmailVerification(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ email: '', password: '', username: '', phone: '' });
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#008069] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Sign in to continue to WhatsApp Clone' : 'Join WhatsApp Clone today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008069] focus:border-transparent"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008069] focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008069] focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008069] focus:border-transparent"
              placeholder="Enter your password"
            />
            {isLogin && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(true)}
                  className="text-sm text-[#008069] hover:text-[#006d5b] focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#008069] hover:bg-[#006d5b] disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-[#008069] hover:text-[#006d5b] font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>

      {/* Modals */}
      <EmailVerificationModal
        isOpen={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        email={formData.email}
      />
      
      <PhoneVerificationModal
        isOpen={showPhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        phone={formData.phone}
      />
      
      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
      />
    </div>
  );
};

export default AuthInterface; 