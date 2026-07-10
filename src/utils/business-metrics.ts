import type {
  Expense,
  ExpenseCategory,
  Project,
  RecurringExpense,
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
