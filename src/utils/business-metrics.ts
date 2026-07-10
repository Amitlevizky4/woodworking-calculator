import type {
  Expense,
  ExpenseCategory,
  LeadSource,
  Project,
  RecurringExpense,
  TimeLog,
} from '@/types';

// Expense categories treated as "fixed" overhead in the P&L split. Everything
// else (materials, consumables, tools, marketing, transport, fees, other) is
// counted as variable.
export const FIXED_EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  'workshop_rent',
  'insurance',
];

export interface MonthlyPnL {
  month: string;
  revenue: number;
  fixedExpenses: number;
  variableExpenses: number;
  totalExpenses: number;
  netProfit: number;
}

export interface CeilingStatus {
  total: number;
  ceiling: number;
  pct: number;
  warning: boolean;
  exceeded: boolean;
}

// ============================================
// Date helpers — month keys are 'YYYY-MM' strings, which sort and compare
// lexicographically, so no Date arithmetic (or timezone risk) is needed.
// ============================================

export function monthKeyOf(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export function addMonths(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number);
  const total = year * 12 + (month - 1) + delta;
  const newYear = Math.floor(total / 12);
  const newMonth = ((total % 12) + 12) % 12;
  return `${newYear}-${String(newMonth + 1).padStart(2, '0')}`;
}

export function trailingMonths(asOfMonth: string, count: number): string[] {
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    months.push(addMonths(asOfMonth, -i));
  }
  return months;
}

// ============================================
// Revenue (cash basis) — a payment is revenue in the month it was received.
// Deposit and balance are counted separately, on their own paid dates.
// ============================================

export function projectRevenueInMonth(
  project: Project,
  monthKey: string,
): number {
  const agreed = project.agreedPrice ?? 0;
  const deposit = project.depositAmount ?? 0;
  let revenue = 0;

  if (project.depositPaidAt && monthKeyOf(project.depositPaidAt) === monthKey) {
    revenue += deposit;
  }
  if (project.balancePaidAt && monthKeyOf(project.balancePaidAt) === monthKey) {
    revenue += Math.max(0, agreed - deposit);
  }
  return revenue;
}

export function calculateTrailing12Revenue(
  projects: Project[],
  asOfMonth: string,
): number {
  const months = trailingMonths(asOfMonth, 12);
  return months.reduce(
    (sum, month) =>
      sum +
      projects.reduce((s, project) => s + projectRevenueInMonth(project, month), 0),
    0,
  );
}

// ============================================
// Monthly P&L — revenue received minus expenses logged, for one month.
// ============================================

export function calculateMonthlyPnL(
  projects: Project[],
  expenses: Expense[],
  monthKey: string,
): MonthlyPnL {
  const revenue = projects.reduce(
    (sum, project) => sum + projectRevenueInMonth(project, monthKey),
    0,
  );

  let fixedExpenses = 0;
  let variableExpenses = 0;
  for (const expense of expenses) {
    if (monthKeyOf(expense.date) !== monthKey) continue;
    if (FIXED_EXPENSE_CATEGORIES.includes(expense.category)) {
      fixedExpenses += expense.amount;
    } else {
      variableExpenses += expense.amount;
    }
  }

  const totalExpenses = fixedExpenses + variableExpenses;
  return {
    month: monthKey,
    revenue,
    fixedExpenses,
    variableExpenses,
    totalExpenses,
    netProfit: revenue - totalExpenses,
  };
}

export function calculateMonthlyTrend(
  projects: Project[],
  expenses: Expense[],
  months: string[],
): MonthlyPnL[] {
  return months.map((month) => calculateMonthlyPnL(projects, expenses, month));
}

// ============================================
// Effective hourly rate — the real ₪/hour earned on a project once the agreed
// price, materials, and project-linked expenses are known against actual hours.
// ============================================

export interface EffectiveHourlyRateInput {
  agreedPrice: number;
  materialsCost: number;
  linkedExpenses: number;
  actualHours: number;
}

export function calculateEffectiveHourlyRate(
  input: EffectiveHourlyRateInput,
): number | null {
  const { agreedPrice, materialsCost, linkedExpenses, actualHours } = input;
  if (!actualHours || actualHours <= 0) return null;
  return (agreedPrice - materialsCost - linkedExpenses) / actualHours;
}

// ============================================
// Target hourly rate check — does a quoted price clear the target ₪/hour after
// materials? Used by the calculator's green/red indicator.
// ============================================

export interface TargetHourlyRateInput {
  price: number;
  materialsCost: number;
  laborHours: number;
  targetHourlyRate: number;
}

export interface TargetHourlyRateResult {
  effectiveRate: number | null;
  meets: boolean;
}

export function evaluateTargetHourlyRate(
  input: TargetHourlyRateInput,
): TargetHourlyRateResult {
  const { price, materialsCost, laborHours, targetHourlyRate } = input;
  if (!laborHours || laborHours <= 0) {
    return { effectiveRate: null, meets: false };
  }
  const effectiveRate = (price - materialsCost) / laborHours;
  return { effectiveRate, meets: effectiveRate >= targetHourlyRate };
}

// ============================================
// עוסק פטור ceiling gauge — trailing 12-month revenue against the annual
// VAT-exempt ceiling, with a warning state at 80%.
// ============================================

export function calculateCeilingStatus(
  trailing12Revenue: number,
  ceiling: number,
): CeilingStatus {
  const pct = ceiling > 0 ? (trailing12Revenue / ceiling) * 100 : 0;
  return {
    total: trailing12Revenue,
    ceiling,
    pct,
    warning: pct >= 80,
    exceeded: trailing12Revenue >= ceiling,
  };
}

// ============================================
// Recurring expenses — determine which monthly instances a rule still owes, so
// the UI can prompt to confirm generating them. Pure; the store persists.
// ============================================

export function recurringExpenseDate(
  periodMonth: string,
  dayOfMonth: number,
): string {
  return `${periodMonth}-${String(dayOfMonth).padStart(2, '0')}`;
}

export function missingRecurringPeriods(
  rule: RecurringExpense,
  existingPeriodMonths: Set<string>,
  currentMonth: string,
): string[] {
  if (!rule.active) return [];

  const missing: string[] = [];
  let month = monthKeyOf(rule.startMonth);
  // Guard against a start month far in the past (or misconfigured) running away.
  let guard = 0;
  while (month <= currentMonth && guard < 240) {
    if (!existingPeriodMonths.has(month)) {
      missing.push(month);
    }
    month = addMonths(month, 1);
    guard++;
  }
  return missing;
}

// ============================================
// Phase 2 — time logs, quarters, product & channel analytics
// ============================================

export function quarterKeyOf(dateStr: string): string {
  const [year, month] = dateStr.slice(0, 7).split('-').map(Number);
  const quarter = Math.floor((month - 1) / 3) + 1;
  return `${year}-Q${quarter}`;
}

export function sumTimeLogHours(logs: TimeLog[], projectId: string): number {
  return logs
    .filter((log) => log.projectId === projectId)
    .reduce((sum, log) => sum + log.hours, 0);
}

/** Hours used for profitability: logged time if any exists, else the manual
 *  actual_hours entered on the project. */
export function effectiveHoursForProject(
  project: Project,
  logs: TimeLog[],
): number {
  const logged = sumTimeLogHours(logs, project.id);
  return logged > 0 ? logged : (project.actualHours ?? 0);
}

export interface LeadSourceRoiRow {
  leadSource: LeadSource;
  count: number;
  revenue: number;
}

/** Projects and committed revenue grouped by lead source. Pass a quarter key
 *  (e.g. '2026-Q1') to restrict to projects dated in that quarter. */
export function calculateLeadSourceRoi(
  projects: Project[],
  quarter?: string,
): LeadSourceRoiRow[] {
  const groups = new Map<LeadSource, { count: number; revenue: number }>();

  for (const project of projects) {
    if (!project.leadSource) continue;
    if (quarter && quarterKeyOf(project.date) !== quarter) continue;

    const g = groups.get(project.leadSource) ?? { count: 0, revenue: 0 };
    g.count += 1;
    g.revenue += project.agreedPrice ?? 0;
    groups.set(project.leadSource, g);
  }

  return Array.from(groups.entries())
    .map(([leadSource, g]): LeadSourceRoiRow => ({ leadSource, ...g }))
    .sort((a, b) => b.revenue - a.revenue);
}

export interface ChannelRoiRow {
  channel: string;
  spend: number;
  revenue: number;
}

/** Marketing spend (from expenses with category 'marketing' and a channel)
 *  next to committed revenue attributed to the matching lead source. Optionally
 *  restricted to a quarter (by expense date and project date respectively). */
export function calculateChannelRoi(
  projects: Project[],
  expenses: Expense[],
  quarter?: string,
): ChannelRoiRow[] {
  const spend = new Map<string, number>();
  const revenue = new Map<string, number>();

  for (const expense of expenses) {
    if (expense.category !== 'marketing' || !expense.channel) continue;
    if (quarter && quarterKeyOf(expense.date) !== quarter) continue;
    spend.set(expense.channel, (spend.get(expense.channel) ?? 0) + expense.amount);
  }

  for (const project of projects) {
    if (!project.leadSource) continue;
    if (quarter && quarterKeyOf(project.date) !== quarter) continue;
    revenue.set(
      project.leadSource,
      (revenue.get(project.leadSource) ?? 0) + (project.agreedPrice ?? 0),
    );
  }

  const channels = new Set<string>([...spend.keys(), ...revenue.keys()]);
  return Array.from(channels)
    .map((channel): ChannelRoiRow => ({
      channel,
      spend: spend.get(channel) ?? 0,
      revenue: revenue.get(channel) ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export interface ProfitGroupInput {
  key: string;
  agreedPrice: number;
  materialsCost: number;
  linkedExpenses: number;
  hours: number;
}

export interface ProfitGroupRow {
  key: string;
  count: number;
  avgPrice: number;
  avgHours: number;
  avgRate: number | null;
  totalProfit: number;
}

/** Aggregate per-project profitability into rows grouped by `key`. Callers
 *  precompute materialsCost/linkedExpenses/hours so this stays pure. */
export function aggregateProfitByGroup(
  items: ProfitGroupInput[],
): ProfitGroupRow[] {
  const groups = new Map<
    string,
    { count: number; priceSum: number; hoursSum: number; rateSum: number; rateCount: number; profitSum: number }
  >();

  for (const item of items) {
    const profit = item.agreedPrice - item.materialsCost - item.linkedExpenses;
    const g = groups.get(item.key) ?? {
      count: 0,
      priceSum: 0,
      hoursSum: 0,
      rateSum: 0,
      rateCount: 0,
      profitSum: 0,
    };
    g.count += 1;
    g.priceSum += item.agreedPrice;
    g.hoursSum += item.hours;
    g.profitSum += profit;
    if (item.hours > 0) {
      g.rateSum += profit / item.hours;
      g.rateCount += 1;
    }
    groups.set(item.key, g);
  }

  return Array.from(groups.entries())
    .map(([key, g]): ProfitGroupRow => ({
      key,
      count: g.count,
      avgPrice: g.priceSum / g.count,
      avgHours: g.hoursSum / g.count,
      avgRate: g.rateCount > 0 ? g.rateSum / g.rateCount : null,
      totalProfit: g.profitSum,
    }))
    .sort((a, b) => b.totalProfit - a.totalProfit);
}
