import { useMemo, useState } from 'react';
import { useStore } from '@/stores/useStore';
import { useBusinessStore } from '@/stores/useBusinessStore';
import { useTranslation } from '@/i18n/useTranslation';
import { calculateMaterialsCost, formatCurrency } from '@/utils/cost-calculator';
import {
  aggregateProfitByGroup,
  calculateChannelRoi,
  calculateLeadSourceRoi,
  effectiveHoursForProject,
  quarterKeyOf,
} from '@/utils/business-metrics';
import type { ProfitGroupInput } from '@/utils/business-metrics';

export function Reports() {
  const { t } = useTranslation();
  const projects = useStore((s) => s.projects);
  const materials = useStore((s) => s.materials);
  const productTypes = useStore((s) => s.productTypes);
  const timeLogs = useStore((s) => s.timeLogs);
  const expenses = useBusinessStore((s) => s.expenses);

  const [quarter, setQuarter] = useState('all');

  const quarterOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) set.add(quarterKeyOf(p.date));
    for (const e of expenses) set.add(quarterKeyOf(e.date));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [projects, expenses]);

  const productTypeName = (id?: string) =>
    (id && productTypes.find((pt) => pt.id === id)?.name) || t('productTypes2.none');

  const inQuarter = (dateStr: string) =>
    quarter === 'all' || quarterKeyOf(dateStr) === quarter;

  const profitItems: ProfitGroupInput[] = projects
    .filter((p) => p.agreedPrice && inQuarter(p.date))
    .map((p) => {
      const materialsCost = calculateMaterialsCost(p.materials, materials);
      const linkedExpenses = expenses
        .filter((e) => e.projectId === p.id)
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        key: productTypeName(p.productTypeId),
        agreedPrice: p.agreedPrice ?? 0,
        materialsCost,
        linkedExpenses,
        hours: effectiveHoursForProject(p, timeLogs),
      };
    });
  const profitRows = aggregateProfitByGroup(profitItems);

  const quarterArg = quarter === 'all' ? undefined : quarter;
  const leadRows = calculateLeadSourceRoi(projects, quarterArg);
  const channelRows = calculateChannelRoi(projects, expenses, quarterArg);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-headline text-3xl font-bold text-on-surface">
          {t('reports.title')}
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
            {t('reports.quarter')}
          </span>
          <select
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="bg-surface-container-highest border-b-2 border-outline focus:border-primary outline-none px-4 py-2 rounded-t-md text-sm"
          >
            <option value="all">{t('reports.allTime')}</option>
            {quarterOptions.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product type profitability */}
      <section className="bg-surface-container-low rounded-xl p-6 overflow-x-auto">
        <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-4">
          {t('reports.productProfitability')}
        </h2>
        {profitRows.length === 0 ? (
          <p className="text-secondary text-sm">{t('reports.noData')}</p>
        ) : (
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary py-2">
                  {t('productTypes2.title')}
                </th>
                <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary py-2">
                  {t('pnl.count')}
                </th>
                <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary py-2">
                  {t('pnl.avgPrice')}
                </th>
                <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary py-2">
                  {t('pnl.avgRate')}
                </th>
                <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary py-2">
                  {t('pnl.totalProfit')}
                </th>
              </tr>
            </thead>
            <tbody>
              {profitRows.map((row) => (
                <tr key={row.key} className="border-t border-outline-variant/20">
                  <td className="py-3 font-medium">{row.key}</td>
                  <td className="py-3 text-end font-mono">{row.count}</td>
                  <td className="py-3 text-end font-mono">{formatCurrency(row.avgPrice)}</td>
                  <td className="py-3 text-end font-mono">
                    {row.avgRate !== null ? `${formatCurrency(row.avgRate)}/hr` : '--'}
                  </td>
                  <td className="py-3 text-end font-mono font-bold text-tertiary">
                    {formatCurrency(row.totalProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Lead source ROI */}
      <section className="bg-surface-container-low rounded-xl p-6 overflow-x-auto">
        <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-4">
          {t('reports.leadSourceRoi')}
        </h2>
        {leadRows.length === 0 ? (
          <p className="text-secondary text-sm">{t('reports.noData')}</p>
        ) : (
          <table className="w-full min-w-[420px]">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary py-2">
                  {t('income.leadSource')}
                </th>
                <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary py-2">
                  {t('reports.projects')}
                </th>
                <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary py-2">
                  {t('reports.revenue')}
                </th>
              </tr>
            </thead>
            <tbody>
              {leadRows.map((row) => (
                <tr key={row.leadSource} className="border-t border-outline-variant/20">
                  <td className="py-3 font-medium">{t(`leadSource.${row.leadSource}`)}</td>
                  <td className="py-3 text-end font-mono">{row.count}</td>
                  <td className="py-3 text-end font-mono font-bold">
                    {formatCurrency(row.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Channel ROI */}
      <section className="bg-surface-container-low rounded-xl p-6 overflow-x-auto">
        <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-4">
          {t('reports.channelRoi')}
        </h2>
        {channelRows.length === 0 ? (
          <p className="text-secondary text-sm">{t('reports.noData')}</p>
        ) : (
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary py-2">
                  {t('reports.channelRoi')}
                </th>
                <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary py-2">
                  {t('reports.spend')}
                </th>
                <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary py-2">
                  {t('reports.revenue')}
                </th>
                <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary py-2">
                  {t('reports.net')}
                </th>
              </tr>
            </thead>
            <tbody>
              {channelRows.map((row) => (
                <tr key={row.channel} className="border-t border-outline-variant/20">
                  <td className="py-3 font-medium">
                    {t(`leadSource.${row.channel}`) === `leadSource.${row.channel}`
                      ? row.channel
                      : t(`leadSource.${row.channel}`)}
                  </td>
                  <td className="py-3 text-end font-mono text-primary">
                    {formatCurrency(row.spend)}
                  </td>
                  <td className="py-3 text-end font-mono text-tertiary">
                    {formatCurrency(row.revenue)}
                  </td>
                  <td className="py-3 text-end font-mono font-bold">
                    {formatCurrency(row.revenue - row.spend)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
