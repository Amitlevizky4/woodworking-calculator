import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useStore } from '@/stores/useStore';
import { useBusinessStore } from '@/stores/useBusinessStore';
import { useTranslation } from '@/i18n/useTranslation';
import { Icon } from '@/components/Icon';
import {
  calculateMaterialsCost,
  calculateLaborCost,
  calculateFinalPrice,
  formatCurrency,
} from '@/utils/cost-calculator';
import {
  calculateCapacityHint,
  calculateCeilingStatus,
  calculateEffectiveHourlyRate,
  calculateMonthlyPnL,
  calculateMonthlyTrend,
  calculateTrailing12Revenue,
  trailingMonths,
} from '@/utils/business-metrics';
import { STATUS_BADGE_CLASSES, STATUS_TKEY } from '@/utils/pipeline';
import type { Expense, Project } from '@/types';

const MONTH_KEYS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
];

function useCurrentTime(): string {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

function getProjectFinalPrice(project: Project, allMaterials: ReturnType<typeof useStore.getState>['materials']): number {
  const materialsCost = calculateMaterialsCost(project.materials, allMaterials);
  const laborCost = calculateLaborCost(project.laborHours, project.hourlyRate);
  const breakdown = calculateFinalPrice({
    materialsCost,
    laborCost,
    markupFactor: project.markupFactor,
    markupAppliedTo: project.markupAppliedTo,
    discountPercent: project.discountPercent,
  });
  return breakdown.finalPrice;
}

interface MonthlyData {
  month: string;
  materials: number;
  labor: number;
}

function buildMonthlyChartData(
  projects: Project[],
  allMaterials: ReturnType<typeof useStore.getState>['materials'],
  t: (key: string) => string,
): MonthlyData[] {
  const monthMap = new Map<string, { materials: number; labor: number }>();

  for (const project of projects) {
    const date = new Date(project.date);
    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
    const existing = monthMap.get(key) ?? { materials: 0, labor: 0 };
    existing.materials += calculateMaterialsCost(project.materials, allMaterials);
    existing.labor += calculateLaborCost(project.laborHours, project.hourlyRate);
    monthMap.set(key, existing);
  }

  if (monthMap.size < 3) {
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, {
          materials: Math.floor(Math.random() * 2000) + 500,
          labor: Math.floor(Math.random() * 1200) + 300,
        });
      }
    }
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, data]) => {
      const monthIndex = parseInt(key.split('-')[1], 10);
      return {
        month: t(`months.${MONTH_KEYS[monthIndex]}`),
        materials: Math.round(data.materials),
        labor: Math.round(data.labor),
      };
    });
}

function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

function CapacityCard({ projects }: { projects: Project[] }) {
  const { t } = useTranslation();
  const timeLogs = useStore((s) => s.timeLogs);
  const weeklyHours = useBusinessStore((s) => s.settings.weeklyHoursBudget);

  const hint = useMemo(
    () =>
      calculateCapacityHint(
        projects,
        timeLogs,
        weeklyHours,
        new Date().toISOString().slice(0, 10),
      ),
    [projects, timeLogs, weeklyHours],
  );

  const available = hint.weeksOut === 0;

  return (
    <div className="bg-surface-container-high p-6 rounded-lg flex items-center gap-4">
      <Icon name="event_available" className="text-primary text-3xl" />
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
          {t('capacity.earliestStart')}
        </p>
        <p className="font-mono text-2xl font-bold mt-1">
          {available ? t('capacity.availableNow') : hint.earliestStart}
        </p>
      </div>
      <div className="text-end">
        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
          {t('capacity.backlog')}
        </p>
        <p className="font-mono text-lg font-bold mt-1">{hint.backlogHours} {t('common.hrs')}</p>
      </div>
    </div>
  );
}

function ProfitTargetBar({ netProfit, target }: { netProfit: number; target: number }) {
  const { t } = useTranslation();
  const pct = target > 0 ? Math.max(0, Math.min(100, (netProfit / target) * 100)) : 0;
  const met = netProfit >= target;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
          {t('pnl.profitTarget')}
        </span>
        <span className="font-mono text-sm text-secondary">
          {formatCurrency(Math.max(0, netProfit))} / {formatCurrency(target)}
        </span>
      </div>
      <div className="h-3 rounded-full bg-surface-variant overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${met ? 'bg-tertiary' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CeilingGauge({
  total,
  ceiling,
}: {
  total: number;
  ceiling: number;
}) {
  const { t } = useTranslation();
  const status = calculateCeilingStatus(total, ceiling);
  const pct = Math.max(0, Math.min(100, status.pct));

  const barColor = status.exceeded
    ? 'bg-error'
    : status.warning
      ? 'bg-error/80'
      : 'bg-tertiary';

  return (
    <div className="bg-surface-container-low p-6 rounded-lg border-b-2 border-outline">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
          {t('pnl.ceilingTitle')}
        </p>
        <span className="text-[10px] text-secondary">{t('pnl.ceilingSubtitle')}</span>
      </div>
      <p className="font-mono text-2xl font-bold mt-1">
        {formatCurrency(status.total)}
        <span className="text-sm text-secondary font-normal">
          {' '}/ {formatCurrency(status.ceiling)}
        </span>
      </p>
      <div className="h-3 rounded-full bg-surface-variant overflow-hidden mt-3">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="font-mono text-xs text-secondary">{status.pct.toFixed(0)}%</span>
        {(status.warning || status.exceeded) && (
          <span className="flex items-center gap-1 text-xs font-medium text-error">
            <Icon name="warning" className="text-sm" />
            {status.exceeded ? t('pnl.ceilingExceeded') : t('pnl.ceilingWarning')}
          </span>
        )}
      </div>
    </div>
  );
}

interface TrendPoint {
  month: string;
  revenue: number;
  expenses: number;
  net: number;
}

function PnLTrendChart({ data }: { data: TrendPoint[] }) {
  const { t } = useTranslation();

  return (
    <div className="bg-surface-container p-8 rounded-lg">
      <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-6">
        {t('pnl.trend')}
      </h2>
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-tertiary" />
          <span className="text-xs text-secondary">{t('pnl.revenue')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-primary" />
          <span className="text-xs text-secondary">{t('pnl.expenses')}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3bfb2" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#5f5e5e' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#5f5e5e' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#f9f9f6',
              border: '1px solid #e3bfb2',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value) => formatCurrency(Number(value))}
          />
          <Bar dataKey="revenue" fill="#4A7C6F" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill="#a43700" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ProfitByTypeRow {
  type: string;
  count: number;
  avgPrice: number;
  avgHours: number;
  avgRate: number | null;
  totalProfit: number;
}

function buildProfitByType(
  projects: Project[],
  allMaterials: ReturnType<typeof useStore.getState>['materials'],
  expenses: Expense[],
): ProfitByTypeRow[] {
  const groups = new Map<
    string,
    { count: number; priceSum: number; hoursSum: number; rateSum: number; rateCount: number; profitSum: number }
  >();

  for (const project of projects) {
    // Only count projects with an agreed price (i.e. actually sold/committed).
    if (!project.agreedPrice) continue;

    const materialsCost = calculateMaterialsCost(project.materials, allMaterials);
    const linkedExpenses = expenses
      .filter((e) => e.projectId === project.id)
      .reduce((sum, e) => sum + e.amount, 0);
    const profit = project.agreedPrice - materialsCost - linkedExpenses;
    const rate = calculateEffectiveHourlyRate({
      agreedPrice: project.agreedPrice,
      materialsCost,
      linkedExpenses,
      actualHours: project.actualHours ?? 0,
    });

    const g = groups.get(project.type) ?? {
      count: 0,
      priceSum: 0,
      hoursSum: 0,
      rateSum: 0,
      rateCount: 0,
      profitSum: 0,
    };
    g.count += 1;
    g.priceSum += project.agreedPrice;
    g.hoursSum += project.actualHours ?? 0;
    g.profitSum += profit;
    if (rate !== null) {
      g.rateSum += rate;
      g.rateCount += 1;
    }
    groups.set(project.type, g);
  }

  return Array.from(groups.entries())
    .map(([type, g]): ProfitByTypeRow => ({
      type,
      count: g.count,
      avgPrice: g.priceSum / g.count,
      avgHours: g.hoursSum / g.count,
      avgRate: g.rateCount > 0 ? g.rateSum / g.rateCount : null,
      totalProfit: g.profitSum,
    }))
    .sort((a, b) => b.totalProfit - a.totalProfit);
}

function ProfitByTypeTable({ rows }: { rows: ProfitByTypeRow[] }) {
  const { t } = useTranslation();

  if (rows.length === 0) return null;

  return (
    <div className="bg-surface-container-low p-6 rounded-lg overflow-x-auto">
      <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-4">
        {t('pnl.profitByType')}
      </h2>
      <table className="w-full min-w-[520px]">
        <thead>
          <tr className="border-b border-outline-variant/30">
            <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary py-2">
              {t('calculator.projectType')}
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
          {rows.map((row) => (
            <tr key={row.type} className="border-t border-outline-variant/20">
              <td className="py-3 font-medium">{t(`projectTypes.${row.type}`)}</td>
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
    </div>
  );
}

function MoneySection({
  projects,
  expenses,
  allMaterials,
}: {
  projects: Project[];
  expenses: Expense[];
  allMaterials: ReturnType<typeof useStore.getState>['materials'];
}) {
  const { t } = useTranslation();
  const settings = useBusinessStore((s) => s.settings);

  const profitByType = useMemo(
    () => buildProfitByType(projects, allMaterials, expenses),
    [projects, allMaterials, expenses],
  );

  const { pnl, ceilingTotal, trend } = useMemo(() => {
    const month = currentMonthKey();
    const months = trailingMonths(month, 6);
    const trendPnl = calculateMonthlyTrend(projects, expenses, months);
    return {
      pnl: calculateMonthlyPnL(projects, expenses, month),
      ceilingTotal: calculateTrailing12Revenue(projects, month),
      trend: trendPnl.map((p): TrendPoint => {
        const monthIndex = parseInt(p.month.split('-')[1], 10) - 1;
        return {
          month: t(`months.${MONTH_KEYS[monthIndex]}`),
          revenue: Math.round(p.revenue),
          expenses: Math.round(p.totalExpenses),
          net: Math.round(p.netProfit),
        };
      }),
    };
  }, [projects, expenses, t]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-4">
          {t('pnl.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-container-low p-6 rounded-lg border-b-2 border-outline">
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
              {t('pnl.revenue')}
            </p>
            <p className="font-mono text-2xl font-bold mt-2 text-tertiary">
              {formatCurrency(pnl.revenue)}
            </p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-lg border-b-2 border-outline">
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
              {t('pnl.expenses')}
            </p>
            <p className="font-mono text-2xl font-bold mt-2 text-primary">
              {formatCurrency(pnl.totalExpenses)}
            </p>
            <p className="text-xs text-secondary mt-1">
              {t('pnl.fixed')} {formatCurrency(pnl.fixedExpenses)} · {t('pnl.variable')}{' '}
              {formatCurrency(pnl.variableExpenses)}
            </p>
          </div>
          <div className="bg-on-surface text-surface p-6 rounded-lg">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
              {t('pnl.netProfit')}
            </p>
            <p className="font-mono text-2xl font-bold mt-2">
              {formatCurrency(pnl.netProfit)}
            </p>
          </div>
        </div>
        <div className="mt-4 bg-surface-container-low p-6 rounded-lg">
          <ProfitTargetBar netProfit={pnl.netProfit} target={settings.monthlyProfitTarget} />
        </div>
      </div>

      <CeilingGauge total={ceilingTotal} ceiling={settings.vatExemptCeiling} />

      <PnLTrendChart data={trend} />

      <ProfitByTypeTable rows={profitByType} />
    </div>
  );
}

function StatsGrid({ projects, allMaterials }: {
  projects: Project[];
  allMaterials: ReturnType<typeof useStore.getState>['materials'];
}) {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === 'in_production');
    const completedProjects = projects.filter(
      (p) => p.status === 'delivered' || p.status === 'closed',
    );

    const totalFinalPrices = projects.map((p) => getProjectFinalPrice(p, allMaterials));
    const avgBuildCost = projects.length > 0
      ? totalFinalPrices.reduce((sum, v) => sum + v, 0) / projects.length
      : 0;

    const totalLaborHours = projects.reduce((sum, p) => sum + p.laborHours, 0);

    const completedRevenue = completedProjects
      .map((p) => getProjectFinalPrice(p, allMaterials))
      .reduce((sum, v) => sum + v, 0);

    return [
      { label: t('dashboard.totalProjects'), value: String(projects.length) },
      { label: t('dashboard.activeShop'), value: String(activeProjects.length) },
      { label: t('dashboard.avgBuildCost'), value: formatCurrency(avgBuildCost) },
      { label: t('dashboard.laborHours'), value: String(totalLaborHours) },
      { label: t('dashboard.monthlyRev'), value: formatCurrency(completedRevenue) },
    ];
  }, [projects, allMaterials, t]);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-surface-container-low p-6 border-b-2 border-outline hover:border-primary transition-colors"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
            {stat.label}
          </p>
          <p className="font-mono text-3xl font-bold mt-2">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function MonthlyChart({ data }: { data: MonthlyData[] }) {
  const { t } = useTranslation();

  return (
    <div className="bg-surface-container p-8 rounded-lg">
      <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-6">
        {t('dashboard.monthlyBreakdown')}
      </h2>
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-primary" />
          <span className="text-xs text-secondary">{t('calculator.materials')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-outline" />
          <span className="text-xs text-secondary">{t('common.labor')}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3bfb2" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#5f5e5e' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#5f5e5e' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#f9f9f6',
              border: '1px solid #e3bfb2',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value) => formatCurrency(Number(value))}
          />
          <Bar dataKey="materials" stackId="costs" fill="#a43700" radius={[0, 0, 0, 0]} />
          <Bar dataKey="labor" stackId="costs" fill="#8f7066" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RecentProjectsTable({ projects, allMaterials }: {
  projects: Project[];
  allMaterials: ReturnType<typeof useStore.getState>['materials'];
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const recentProjects = useMemo(() =>
    [...projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5),
    [projects],
  );

  return (
    <div className="bg-surface-container-low p-8">
      <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-6">
        {t('dashboard.recentProjects')}
      </h2>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary pb-4">
              {t('projects.projectName')}
            </th>
            <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary pb-4">
              {t('projects.status')}
            </th>
            <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary pb-4">
              {t('projects.totalCost')}
            </th>
            <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary pb-4">
              {t('projects.action')}
            </th>
          </tr>
        </thead>
        <tbody>
          {recentProjects.map((project) => {
            const finalPrice = getProjectFinalPrice(project, allMaterials);
            return (
              <tr key={project.id} className="border-t border-outline-variant/30">
                <td className="py-3 font-medium">{project.name}</td>
                <td className="py-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_CLASSES[project.status]}`}>
                    {t(STATUS_TKEY[project.status])}
                  </span>
                </td>
                <td className="py-3 font-mono font-bold">{formatCurrency(finalPrice)}</td>
                <td className="py-3">
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    {t('projects.inspect')}
                  </button>
                </td>
              </tr>
            );
          })}
          {recentProjects.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 text-center text-secondary">
                {t('dashboard.noProjects')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PerformancePanel({ projects, allMaterials }: {
  projects: Project[];
  allMaterials: ReturnType<typeof useStore.getState>['materials'];
}) {
  const { t } = useTranslation();

  const highlights = useMemo(() => {
    if (projects.length === 0) {
      return { mostExpensive: null, cheapest: null, commonType: null, commonPercent: 0 };
    }

    const projectsWithPrice = projects.map((p) => ({
      project: p,
      price: getProjectFinalPrice(p, allMaterials),
    }));

    const sorted = [...projectsWithPrice].sort((a, b) => b.price - a.price);
    const mostExpensive = sorted[0];
    const cheapest = sorted[sorted.length - 1];

    const typeCount = new Map<string, number>();
    for (const p of projects) {
      typeCount.set(p.type, (typeCount.get(p.type) ?? 0) + 1);
    }
    let commonType = '';
    let maxCount = 0;
    for (const [type, count] of typeCount) {
      if (count > maxCount) {
        maxCount = count;
        commonType = type;
      }
    }
    const commonPercent = Math.round((maxCount / projects.length) * 100);

    return { mostExpensive, cheapest, commonType, commonPercent };
  }, [projects, allMaterials]);

  const commonTypeKey = `projectTypes.${highlights.commonType}`;
  const commonTypeValue = t(commonTypeKey);
  const commonTypeLabel =
    commonTypeValue === commonTypeKey ? highlights.commonType : commonTypeValue;

  return (
    <div className="glass-panel border-s-4 border-primary p-6">
      <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-6">
        {t('dashboard.performanceHighlights')}
      </h2>
      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
            {t('dashboard.mostExpensive')}
          </p>
          {highlights.mostExpensive ? (
            <p className="font-mono text-lg font-bold mt-1">
              {highlights.mostExpensive.project.name}{' '}
              <span className="text-primary">{formatCurrency(highlights.mostExpensive.price)}</span>
            </p>
          ) : (
            <p className="text-secondary text-sm mt-1">--</p>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
            {t('dashboard.cheapest')}
          </p>
          {highlights.cheapest ? (
            <p className="font-mono text-lg font-bold mt-1">
              {highlights.cheapest.project.name}{' '}
              <span className="text-tertiary">{formatCurrency(highlights.cheapest.price)}</span>
            </p>
          ) : (
            <p className="text-secondary text-sm mt-1">--</p>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
            {t('dashboard.commonType')}
          </p>
          {highlights.commonType ? (
            <p className="font-mono text-lg font-bold mt-1">
              {commonTypeLabel}{' '}
              <span className="text-secondary text-sm">({highlights.commonPercent}%)</span>
            </p>
          ) : (
            <p className="text-secondary text-sm mt-1">--</p>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions = [
    { labelKey: 'dashboard.addRawMaterial', icon: 'add_circle', path: '/materials' },
    { labelKey: 'dashboard.viewPartsLibrary', icon: 'inventory_2', path: '/materials' },
    { labelKey: 'dashboard.logBenchTime', icon: 'timer', path: '/calculator' },
  ];

  return (
    <div className="bg-surface-container-high p-6">
      <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-4">
        {t('dashboard.shopFloorTasks')}
      </h2>
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.labelKey}
            onClick={() => navigate(action.path)}
            className="w-full flex items-center justify-between p-4 bg-surface hover:bg-white transition-colors rounded"
          >
            <div className="flex items-center gap-3">
              <Icon name={action.icon} className="text-primary" />
              <span className="text-sm font-medium">{t(action.labelKey)}</span>
            </div>
            <Icon name="chevron_right" className="text-secondary" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { t } = useTranslation();
  const projects = useStore((state) => state.projects);
  const materials = useStore((state) => state.materials);
  const expenses = useBusinessStore((state) => state.expenses);
  const currentTime = useCurrentTime();

  const chartData = useMemo(
    () => buildMonthlyChartData(projects, materials, t),
    [projects, materials, t],
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold text-on-surface">
          {t('dashboard.workshopOverview')}
        </h1>
        <p className="text-secondary mt-1">
          {t('dashboard.subtitle')}
        </p>
        <p className="font-mono text-sm text-secondary mt-1">{currentTime}</p>
      </div>

      <MoneySection projects={projects} expenses={expenses} allMaterials={materials} />

      <CapacityCard projects={projects} />

      <StatsGrid projects={projects} allMaterials={materials} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <MonthlyChart data={chartData} />
          <RecentProjectsTable projects={projects} allMaterials={materials} />
        </div>

        <div className="space-y-8">
          <PerformancePanel projects={projects} allMaterials={materials} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
