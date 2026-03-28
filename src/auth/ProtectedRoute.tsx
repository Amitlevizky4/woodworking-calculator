import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { useTranslation } from '@/i18n/useTranslation';
import { Icon } from '@/components/Icon';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface gap-4">
        <Icon name="progress_activity" className="text-primary text-4xl animate-spin" />
        <p className="text-secondary font-body text-sm">{t('auth.loading')}</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
