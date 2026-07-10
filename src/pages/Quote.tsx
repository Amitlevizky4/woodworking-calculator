import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/stores/useStore';
import { useBusinessStore } from '@/stores/useBusinessStore';
import { useShopStore } from '@/stores/useShopStore';
import { useTranslation } from '@/i18n/useTranslation';
import { Icon } from '@/components/Icon';
import {
  calculateMaterialsCost,
  calculateLaborCost,
  calculateFinalPrice,
  formatCurrency,
} from '@/utils/cost-calculator';

export function Quote() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projects = useStore((s) => s.projects);
  const materials = useStore((s) => s.materials);
  const settings = useBusinessStore((s) => s.settings);
  const shops = useShopStore((s) => s.shops);
  const activeShopId = useShopStore((s) => s.activeShopId);

  const project = useMemo(
    () => projects.find((p) => p.id === id) ?? null,
    [projects, id],
  );

  const shopName = shops.find((s) => s.id === activeShopId)?.name ?? 'Workshop';

  const price = useMemo(() => {
    if (!project) return 0;
    if (project.agreedPrice) return project.agreedPrice;
    const materialsCost = calculateMaterialsCost(project.materials, materials);
    const laborCost = calculateLaborCost(project.laborHours, project.hourlyRate);
    return calculateFinalPrice({
      materialsCost,
      laborCost,
      markupFactor: project.markupFactor,
      markupAppliedTo: project.markupAppliedTo,
      discountPercent: project.discountPercent,
    }).finalPrice;
  }, [project, materials]);

  if (!project) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center">
        <p className="text-secondary text-lg">Project not found</p>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 text-primary font-medium hover:underline"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const deposit = project.depositAmount ?? price * 0.5;
  const balance = Math.max(0, price - deposit);

  const estDelivery = project.deliveredAt
    ? project.deliveredAt
    : `~${Math.max(1, Math.ceil(project.laborHours / (settings.weeklyHoursBudget || 25)))} weeks`;

  return (
    <div className="min-h-screen bg-surface p-4 md:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6 no-print">
          <button
            onClick={() => navigate(`/projects/${project.id}`)}
            className="flex items-center gap-2 text-secondary hover:text-on-surface transition-colors"
          >
            <Icon name="arrow_back" className="text-lg" />
            {t('common.cancel')}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Icon name="print" className="text-lg" />
            {t('quote.print')}
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-outline-variant">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-outline-variant pb-6 mb-6">
            <div>
              <h1 className="font-headline text-2xl font-bold text-on-surface">
                {shopName}
              </h1>
              <p className="text-secondary text-sm mt-1 uppercase tracking-widest">
                {t('quote.title')}
              </p>
            </div>
            <div className="text-end text-sm text-secondary">
              <p>
                {t('quote.date')}: {new Date().toISOString().slice(0, 10)}
              </p>
              <p className="font-mono">{project.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          {/* Client */}
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
              {t('quote.preparedFor')}
            </p>
            <p className="text-lg font-medium mt-1">
              {project.buyerName || '—'}
            </p>
          </div>

          {/* Item */}
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary py-2">
                  {t('quote.item')}
                </th>
                <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary py-2">
                  {t('quote.total')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-outline-variant/40">
                <td className="py-4">
                  <p className="font-medium">{project.name}</p>
                  {project.description && (
                    <p className="text-sm text-secondary mt-0.5">
                      {project.description}
                    </p>
                  )}
                </td>
                <td className="py-4 text-end font-mono font-bold">
                  {formatCurrency(price)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Payment terms */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{t('quote.depositDue')}</span>
              <span className="font-mono font-bold">{formatCurrency(deposit)}</span>
            </div>
            <div className="flex justify-between items-center text-secondary">
              <span className="text-sm">{t('quote.balanceDue')}</span>
              <span className="font-mono">{formatCurrency(balance)}</span>
            </div>
            <div className="flex justify-between items-center text-secondary">
              <span className="text-sm">{t('quote.estDelivery')}</span>
              <span className="font-mono">{estDelivery}</span>
            </div>
          </div>

          {/* Terms */}
          <div className="border-t border-outline-variant pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">
              {t('quote.terms')}
            </p>
            <p className="text-xs text-secondary leading-relaxed">
              {t('quote.termsText')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
