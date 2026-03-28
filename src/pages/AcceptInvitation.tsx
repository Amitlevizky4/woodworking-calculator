import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { useTranslation } from '@/i18n/useTranslation';
import { useAuth } from '@/auth/AuthProvider';
import { useShopStore } from '@/stores/useShopStore';
import { supabase } from '@/lib/supabase';

type AcceptStatus = 'idle' | 'processing' | 'success' | 'already-member' | 'error';

export function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const fetchShops = useShopStore((state) => state.fetchShops);
  const setActiveShop = useShopStore((state) => state.setActiveShop);

  const [status, setStatus] = useState<AcceptStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (authLoading || !user || !token || status !== 'idle') return;

    const acceptInvitation = async () => {
      setStatus('processing');

      try {
        const { error } = await supabase.rpc('accept_invitation', {
          p_token: token,
        });

        if (error) {
          if (error.message.includes('already a member')) {
            setStatus('already-member');
            return;
          }
          throw error;
        }

        setStatus('success');
        await fetchShops();

        const shops = useShopStore.getState().shops;
        if (shops.length > 0) {
          const lastShop = shops[shops.length - 1];
          await setActiveShop(lastShop.id);
        }

        setTimeout(() => navigate('/'), 1500);
      } catch (err) {
        setStatus('error');
        setErrorMessage(
          err instanceof Error ? err.message : t('onboarding.joinError'),
        );
      }
    };

    acceptInvitation();
  }, [authLoading, user, token, status, fetchShops, setActiveShop, navigate, t]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface gap-4">
        <Icon name="progress_activity" className="text-primary text-4xl animate-spin" />
        <p className="text-secondary font-body text-sm">{t('auth.loading')}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface gap-6 px-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon name="link" className="text-3xl text-primary" />
        </div>

        <div className="text-center max-w-sm">
          <h1 className="font-headline text-2xl font-bold text-on-surface mb-2">
            {t('invite.loginRequired')}
          </h1>
          <p className="text-secondary text-sm">
            {t('invite.loginDescription')}
          </p>
        </div>

        <button
          onClick={signInWithGoogle}
          className="flex items-center justify-center gap-3 bg-on-surface text-surface rounded-lg font-bold py-3 px-8 hover:bg-primary transition-colors text-sm"
        >
          <Icon name="login" className="text-xl" />
          {t('invite.signInToContinue')}
        </button>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface gap-4">
        <Icon name="progress_activity" className="text-primary text-4xl animate-spin" />
        <p className="text-secondary font-body text-sm">{t('invite.processing')}</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface gap-4">
        <div className="w-16 h-16 rounded-full bg-tertiary/10 flex items-center justify-center">
          <Icon name="check_circle" className="text-4xl text-tertiary" />
        </div>
        <h2 className="font-headline text-xl font-bold text-on-surface">
          {t('invite.success')}
        </h2>
        <p className="text-secondary text-sm">{t('invite.redirecting')}</p>
      </div>
    );
  }

  if (status === 'already-member') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface gap-4 px-6">
        <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center">
          <Icon name="info" className="text-3xl text-secondary" />
        </div>
        <h2 className="font-headline text-xl font-bold text-on-surface">
          {t('invite.alreadyMember')}
        </h2>
        <p className="text-secondary text-sm text-center">
          {t('invite.alreadyMemberDescription')}
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold text-sm hover:bg-primary-container transition-colors"
        >
          {t('invite.goToDashboard')}
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface gap-4 px-6">
        <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center">
          <Icon name="error" className="text-3xl text-error" />
        </div>
        <h2 className="font-headline text-xl font-bold text-on-surface">
          {t('invite.error')}
        </h2>
        <p className="text-secondary text-sm text-center max-w-sm">
          {errorMessage}
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-on-surface text-surface rounded-lg font-bold text-sm hover:bg-primary transition-colors"
        >
          {t('invite.goToDashboard')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface gap-4">
      <Icon name="progress_activity" className="text-primary text-4xl animate-spin" />
    </div>
  );
}
