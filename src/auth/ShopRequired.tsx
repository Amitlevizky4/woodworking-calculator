import { Navigate, Outlet } from 'react-router-dom';
import { useShopStore } from '@/stores/useShopStore';
import { useTranslation } from '@/i18n/useTranslation';
import { Icon } from '@/components/Icon';

export function ShopRequired() {
  const { t } = useTranslation();
  const shops = useShopStore((state) => state.shops);
  const activeShopId = useShopStore((state) => state.activeShopId);
  const loading = useShopStore((state) => state.loading);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface gap-4">
        <Icon name="progress_activity" className="text-primary text-4xl animate-spin" />
        <p className="text-secondary font-body text-sm">{t('auth.loading')}</p>
      </div>
    );
  }

  if (shops.length === 0 || !activeShopId) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
