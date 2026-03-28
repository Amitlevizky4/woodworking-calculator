import { useStore } from '@/stores/useStore';
import { translations } from '@/i18n/translations';

type Direction = 'ltr' | 'rtl';

interface UseTranslationReturn {
  t: (key: string) => string;
  language: 'en' | 'he';
  toggleLanguage: () => void;
  dir: Direction;
}

export function useTranslation(): UseTranslationReturn {
  const language = useStore((state) => state.language);
  const toggleLanguage = useStore((state) => state.toggleLanguage);

  const t = (key: string): string => {
    const keys = key.split('.');
    let result: unknown = translations[language];

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = (result as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }

    return typeof result === 'string' ? result : key;
  };

  const dir: Direction = language === 'he' ? 'rtl' : 'ltr';

  return { t, language, toggleLanguage, dir };
}
