'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import AuthInterface from '@/components/AuthInterface';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading while checking authentication
  if (loading || !isClient) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show authentication interface if not authenticated
  if (!isAuthenticated) {
    return <AuthInterface />;
  }

  // Show chat interface if authenticated
  return <ChatInterface />;
}
