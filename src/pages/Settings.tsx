import { useState } from 'react';
import { useBusinessStore } from '@/stores/useBusinessStore';
import { useTranslation } from '@/i18n/useTranslation';
import { Icon } from '@/components/Icon';
import type { ShopSettings } from '@/types';

const INPUT_CLASS =
  'w-full bg-surface-container-highest border-b-2 border-outline focus:border-primary focus:ring-0 px-4 py-3 outline-none rounded-t-md text-on-surface font-mono';

interface SettingField {
  key: keyof ShopSettings;
  labelKey: string;
  prefix?: string;
  suffix?: string;
}

const FIELDS: readonly SettingField[] = [
  { key: 'monthlyProfitTarget', labelKey: 'settings.monthlyProfitTarget', prefix: '₪' },
  { key: 'vatExemptCeiling', labelKey: 'settings.vatExemptCeiling', prefix: '₪' },
  { key: 'targetHourlyRate', labelKey: 'settings.targetHourlyRate', prefix: '₪' },
  { key: 'weeklyHoursBudget', labelKey: 'settings.weeklyHoursBudget', suffix: 'hrs' },
] as const;

export function Settings() {
  const { t } = useTranslation();
  const settings = useBusinessStore((s) => s.settings);
  const updateSettings = useBusinessStore((s) => s.updateSettings);

  const [form, setForm] = useState<ShopSettings>(settings);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof ShopSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
    setSaved(false);
  };

  const handleSave = async () => {
    await updateSettings(form);
    setSaved(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold text-on-surface">
          {t('settings.title')}
        </h1>
        <p className="text-secondary mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="bg-surface-container rounded-2xl p-6 space-y-5">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
              {t(field.labelKey)}
            </label>
            <div className="relative">
              {field.prefix && (
                <span className="absolute start-4 top-1/2 -translate-y-1/2 text-secondary text-sm">
                  {field.prefix}
                </span>
              )}
              <input
                type="number"
                value={form[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                min={0}
                className={`${INPUT_CLASS} ${field.prefix ? 'ps-8' : ''} ${field.suffix ? 'pe-14' : ''}`}
              />
              {field.suffix && (
                <span className="absolute end-4 top-1/2 -translate-y-1/2 text-secondary text-sm">
                  {field.suffix}
                </span>
              )}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Icon name="save" className="text-lg" />
            {t('common.save')}
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-tertiary text-sm font-medium">
              <Icon name="check_circle" className="text-base" />
              {t('settings.saved')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
