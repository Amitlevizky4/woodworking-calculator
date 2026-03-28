import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { useTranslation } from '@/i18n/useTranslation';
import { useShopStore } from '@/stores/useShopStore';
import { supabase } from '@/lib/supabase';

function CreateWorkshopCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createShop = useShopStore((state) => state.createShop);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError(t('onboarding.nameRequired'));
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await createShop(name.trim(), description.trim() || undefined);
      navigate('/');
    } catch {
      setError(t('onboarding.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Icon name="store" className="text-4xl text-primary" />
        <h3 className="font-headline text-lg font-bold text-on-surface">
          {t('onboarding.createWorkshop')}
        </h3>
      </div>

      <p className="text-sm text-secondary">
        {t('onboarding.createDescription')}
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-on-surface mb-1">
            {t('onboarding.shopName')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('onboarding.shopNamePlaceholder')}
            className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface mb-1">
            {t('onboarding.shopDescription')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('onboarding.shopDescriptionPlaceholder')}
            rows={2}
            className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-error font-medium">{error}</p>
      )}

      <button
        onClick={handleCreate}
        disabled={isSubmitting}
        className="w-full py-2.5 bg-primary text-on-primary rounded-lg font-bold text-sm hover:bg-primary-container transition-colors disabled:opacity-50"
      >
        {isSubmitting ? t('common.saving') : t('onboarding.createWorkshop')}
      </button>
    </div>
  );
}

function JoinWorkshopCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fetchShops = useShopStore((state) => state.fetchShops);

  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoin = async () => {
    if (!token.trim()) {
      setError(t('onboarding.tokenRequired'));
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const { error: rpcError } = await supabase.rpc('accept_invitation', {
        p_token: token.trim(),
      });

      if (rpcError) throw rpcError;

      await fetchShops();
      navigate('/');
    } catch {
      setError(t('onboarding.joinError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Icon name="group_add" className="text-4xl text-tertiary" />
        <h3 className="font-headline text-lg font-bold text-on-surface">
          {t('onboarding.joinWorkshop')}
        </h3>
      </div>

      <p className="text-sm text-secondary">
        {t('onboarding.joinDescription')}
      </p>

      <div>
        <label className="block text-xs font-bold text-on-surface mb-1">
          {t('onboarding.invitationCode')}
        </label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={t('onboarding.invitationCodePlaceholder')}
          className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {error && (
        <p className="text-xs text-error font-medium">{error}</p>
      )}

      <button
        onClick={handleJoin}
        disabled={isSubmitting}
        className="w-full py-2.5 bg-on-surface text-surface rounded-lg font-bold text-sm hover:bg-primary transition-colors disabled:opacity-50"
      >
        {isSubmitting ? t('common.saving') : t('onboarding.joinWorkshop')}
      </button>
    </div>
  );
}

export function Onboarding() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-surface">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-surface-container relative overflow-hidden">
        <div className="industrial-grid absolute inset-0" />

        <div className="relative z-10 px-16 max-w-xl">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center mb-6">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6l3-3h12l3 3" />
                <path d="M3 6v14a2 2 0 002 2h14a2 2 0 002-2V6" />
                <path d="M12 6v16" />
                <path d="M3 13h18" />
              </svg>
            </div>
          </div>

          <h1 className="font-headline text-5xl font-bold text-on-surface leading-tight tracking-tight mb-6">
            {t('auth.precisionWorkshop')}
          </h1>

          <p className="text-xl text-secondary font-body leading-relaxed">
            {t('auth.precisionSubtitle')}
          </p>

          <div className="mt-12 flex gap-3">
            <div className="w-12 h-1 rounded-full bg-primary" />
            <div className="w-12 h-1 rounded-full bg-outline-variant" />
            <div className="w-12 h-1 rounded-full bg-outline-variant" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">
              {t('onboarding.welcome')}
            </h2>
            <p className="text-secondary font-body">
              {t('onboarding.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CreateWorkshopCard />
            <JoinWorkshopCard />
          </div>
        </div>
      </div>
    </div>
  );
}
