"use client"

import { useAuth } from '@/components/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'recruiter' | 'applicant' | null;
}

export default function AuthGuard({ children, requiredRole = null }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!user && !isPublicRoute(pathname)) {
        router.push('/login');
        return;
      }

      // Authenticated but wrong role
      if (user && requiredRole && user.role !== requiredRole) {
        // Redirect based on role
        if (user.role === 'recruiter') {
          router.push('/home');
        } else {
          router.push('/home');
        }
        return;
      }

      // If on login/signup page but already logged in
      if (user && (pathname === '/login' || pathname === '/signup')) {
        router.push('/home');
        return;
      }
    }
  }, [user, loading, pathname, router, requiredRole]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Public route or authenticated with correct role
  if (isPublicRoute(pathname) || !requiredRole || (user && requiredRole === user.role)) {
    return <>{children}</>;
  }

  // Don't render anything while redirecting
  return null;
}

// Define public routes that don't require authentication
function isPublicRoute(pathname: string): boolean {
  const publicRoutes = ['/login', '/signup', '/'];
  return publicRoutes.includes(pathname);
} 