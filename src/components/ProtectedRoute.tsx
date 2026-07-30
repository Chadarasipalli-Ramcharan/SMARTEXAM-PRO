import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoadingScreen } from '@/components/Loading';

interface Props {
  children: ReactNode;
  roles?: ('admin' | 'student')[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { session, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;
  // If roles are specified, we need the profile to be loaded before deciding
  if (roles && !profile) return <LoadingScreen />;
  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return <>{children}</>;
}
