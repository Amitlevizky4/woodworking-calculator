import { useAuth } from '@/auth/AuthProvider';
import { useTranslation } from '@/i18n/useTranslation';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export function Login() {
  const { signInWithGoogle } = useAuth();
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
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center">
              <svg
                width="28"
                height="28"
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

          <div className="text-center mb-10">
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">
              {t('auth.welcomeBack')}
            </h2>
            <p className="text-secondary font-body">
              {t('auth.signInSubtitle')}
            </p>
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-on-surface text-surface rounded-lg font-bold py-4 px-8 hover:bg-primary transition-colors duration-200 font-body text-base"
          >
            <GoogleIcon />
            {t('auth.continueWithGoogle')}
          </button>

          <p className="text-center text-xs text-secondary mt-8 font-body">
            {t('auth.secureLogin')}
          </p>
        </div>
      </div>
    </div>
  );
}
