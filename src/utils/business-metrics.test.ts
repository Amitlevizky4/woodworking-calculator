import { describe, it, expect } from 'vitest';
import type { Expense, Project, RecurringExpense, TimeLog } from '@/types';
import {
  addMonths,
  aggregateProfitByGroup,
  calculateCeilingStatus,
  calculateChannelRoi,
  calculateEffectiveHourlyRate,
  calculateLeadSourceRoi,
  calculateMonthlyPnL,
  calculateTrailing12Revenue,
  effectiveHoursForProject,
  evaluateTargetHourlyRate,
  missingRecurringPeriods,
  monthKeyOf,
  projectRevenueInMonth,
  quarterKeyOf,
  recurringExpenseDate,
  sumTimeLogHours,
  trailingMonths,
} from '@/utils/business-metrics';

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'p1',
    name: 'Test Project',
    type: 'table',
    date: '2026-02-15',
    status: 'closed',
    onHold: false,
    materials: [],
    woodParts: [],
    laborHours: 20,
    hourlyRate: 150,
    markupFactor: 1.3,
    markupAppliedTo: 'materials+labor',
    discountPercent: 0,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    ...overrides,
  };
}

function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: 'e1',
    date: '2026-02-10',
    amount: 100,
    category: 'materials',
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
    ...overrides,
  };
}

describe('date helpers', () => {
  it('extracts a YYYY-MM month key from an ISO date', () => {
    expect(monthKeyOf('2026-02-15')).toBe('2026-02');
    expect(monthKeyOf('2026-12-31T10:00:00Z')).toBe('2026-12');
  });

  it('adds and subtracts months across year boundaries', () => {
    expect(addMonths('2026-02', 1)).toBe('2026-03');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-06', -12)).toBe('2025-06');
  });

  it('builds a trailing list of month keys ending at the given month', () => {
    expect(trailingMonths('2026-03', 3)).toEqual(['2026-01', '2026-02', '2026-03']);
  });
});

describe('projectRevenueInMonth (cash basis)', () => {
  it('counts the deposit only in the month it was received', () => {
    const project = makeProject({
      agreedPrice: 4500,
      depositAmount: 2250,
      depositPaidAt: '2026-01-20',
      balancePaidAt: '2026-02-15',
    });
    expect(projectRevenueInMonth(project, '2026-01')).toBe(2250);
  });

  it('counts the balance (agreed minus deposit) in the balance month', () => {
    const project = makeProject({
      agreedPrice: 4500,
      depositAmount: 2250,
      depositPaidAt: '2026-01-20',
      balancePaidAt: '2026-02-15',
    });
    expect(projectRevenueInMonth(project, '2026-02')).toBe(2250);
  });

  it('returns zero for a month with no payment received', () => {
    const project = makeProject({
      agreedPrice: 4500,
      depositAmount: 2250,
      depositPaidAt: '2026-01-20',
    });
    expect(projectRevenueInMonth(project, '2026-03')).toBe(0);
  });

  it('treats a full payment with no deposit as balance-only', () => {
    const project = makeProject({
      agreedPrice: 1000,
      depositAmount: undefined,
      balancePaidAt: '2026-04-05',
    });
    expect(projectRevenueInMonth(project, '2026-04')).toBe(1000);
  });
});

describe('calculateMonthlyPnL', () => {
  it('splits fixed vs variable expenses and computes net profit', () => {
    const projects = [
      makeProject({
        agreedPrice: 4500,
        depositAmount: 2250,
        depositPaidAt: '2026-02-05',
        balancePaidAt: '2026-02-20',
      }),
    ];
    const expenses = [
      makeExpense({ id: 'rent', category: 'workshop_rent', amount: 1200, date: '2026-02-01' }),
      makeExpense({ id: 'mat', category: 'materials', amount: 320, date: '2026-02-10' }),
      makeExpense({ id: 'ins', category: 'insurance', amount: 200, date: '2026-02-12' }),
      makeExpense({ id: 'other-month', category: 'materials', amount: 999, date: '2026-03-01' }),
    ];

    const pnl = calculateMonthlyPnL(projects, expenses, '2026-02');

    expect(pnl.revenue).toBe(4500);
    expect(pnl.fixedExpenses).toBe(1400); // rent + insurance
    expect(pnl.variableExpenses).toBe(320); // materials only (other month excluded)
    expect(pnl.totalExpenses).toBe(1720);
    expect(pnl.netProfit).toBe(2780);
  });

  it('returns zeros for an empty month', () => {
    const pnl = calculateMonthlyPnL([], [], '2026-05');
    expect(pnl).toMatchObject({
      revenue: 0,
      fixedExpenses: 0,
      variableExpenses: 0,
      totalExpenses: 0,
      netProfit: 0,
    });
  });
});

describe('calculateEffectiveHourlyRate', () => {
  it('computes (agreed - materials - linked expenses) / actual hours', () => {
    const rate = calculateEffectiveHourlyRate({
      agreedPrice: 4500,
      materialsCost: 600,
      linkedExpenses: 300,
      actualHours: 24,
    });
    expect(rate).toBe(150);
  });

  it('returns null when actual hours are missing or zero', () => {
    expect(
      calculateEffectiveHourlyRate({
        agreedPrice: 4500,
        materialsCost: 600,
        linkedExpenses: 0,
        actualHours: 0,
      }),
    ).toBeNull();
  });
});

describe('evaluateTargetHourlyRate', () => {
  it('flags a quote that clears the target rate', () => {
    const result = evaluateTargetHourlyRate({
      price: 3600,
      materialsCost: 600,
      laborHours: 20,
      targetHourlyRate: 150,
    });
    expect(result.effectiveRate).toBe(150);
    expect(result.meets).toBe(true);
  });

  it('flags a quote that falls short of the target rate', () => {
    const result = evaluateTargetHourlyRate({
      price: 2000,
      materialsCost: 600,
      laborHours: 20,
      targetHourlyRate: 150,
    });
    expect(result.effectiveRate).toBe(70);
    expect(result.meets).toBe(false);
  });

  it('returns null rate and does not meet when labor hours are zero', () => {
    const result = evaluateTargetHourlyRate({
      price: 2000,
      materialsCost: 600,
      laborHours: 0,
      targetHourlyRate: 150,
    });
    expect(result.effectiveRate).toBeNull();
    expect(result.meets).toBe(false);
  });
});

describe('calculateTrailing12Revenue', () => {
  it('sums revenue received within the trailing 12 months', () => {
    const projects = [
      makeProject({ agreedPrice: 4500, depositAmount: 0, balancePaidAt: '2026-02-15' }),
      makeProject({ id: 'p2', agreedPrice: 3000, depositAmount: 0, balancePaidAt: '2025-09-10' }),
      // outside the window (13 months before 2026-07)
      makeProject({ id: 'p3', agreedPrice: 9999, depositAmount: 0, balancePaidAt: '2025-06-01' }),
    ];
    // window is 2025-08 .. 2026-07
    expect(calculateTrailing12Revenue(projects, '2026-07')).toBe(7500);
  });
});

describe('calculateCeilingStatus', () => {
  it('reports percentage of the ceiling used', () => {
    const status = calculateCeilingStatus(61416.5, 122833);
    expect(status.pct).toBeCloseTo(50, 5);
    expect(status.warning).toBe(false);
    expect(status.exceeded).toBe(false);
  });

  it('raises a warning at 80% of the ceiling', () => {
    const status = calculateCeilingStatus(98266.4, 122833);
    expect(status.pct).toBeGreaterThanOrEqual(80);
    expect(status.warning).toBe(true);
    expect(status.exceeded).toBe(false);
  });

  it('marks the ceiling as exceeded once revenue reaches it', () => {
    const status = calculateCeilingStatus(130000, 122833);
    expect(status.warning).toBe(true);
    expect(status.exceeded).toBe(true);
  });
});

describe('recurring expenses', () => {
  function makeRule(overrides: Partial<RecurringExpense> = {}): RecurringExpense {
    return {
      id: 'r1',
      amount: 1200,
      category: 'workshop_rent',
      dayOfMonth: 1,
      active: true,
      startMonth: '2026-01-01',
      createdAt: '2026-01-01T00:00:00Z',
      ...overrides,
    };
  }

  it('builds a padded expense date from a period month and day', () => {
    expect(recurringExpenseDate('2026-03', 1)).toBe('2026-03-01');
    expect(recurringExpenseDate('2026-03', 15)).toBe('2026-03-15');
  });

  it('lists months from start to current that have not been generated yet', () => {
    const rule = makeRule({ startMonth: '2026-01-01' });
    const existing = new Set(['2026-01', '2026-03']);
    expect(missingRecurringPeriods(rule, existing, '2026-04')).toEqual([
      '2026-02',
      '2026-04',
    ]);
  });

  it('returns nothing for an inactive rule', () => {
    const rule = makeRule({ active: false });
    expect(missingRecurringPeriods(rule, new Set(), '2026-04')).toEqual([]);
  });

  it('returns nothing when every month is already generated', () => {
    const rule = makeRule({ startMonth: '2026-03-01' });
    const existing = new Set(['2026-03', '2026-04']);
    expect(missingRecurringPeriods(rule, existing, '2026-04')).toEqual([]);
  });
});

describe('quarterKeyOf', () => {
  it('maps months to calendar quarters', () => {
    expect(quarterKeyOf('2026-01-15')).toBe('2026-Q1');
    expect(quarterKeyOf('2026-03-31')).toBe('2026-Q1');
    expect(quarterKeyOf('2026-04-01')).toBe('2026-Q2');
    expect(quarterKeyOf('2026-12-01')).toBe('2026-Q4');
  });
});

describe('time logs', () => {
  const logs: TimeLog[] = [
    { id: 't1', projectId: 'p1', date: '2026-02-03', hours: 8, createdAt: '' },
    { id: 't2', projectId: 'p1', date: '2026-02-07', hours: 10, createdAt: '' },
    { id: 't3', projectId: 'p2', date: '2026-02-07', hours: 4, createdAt: '' },
  ];

  it('sums hours for a single project', () => {
    expect(sumTimeLogHours(logs, 'p1')).toBe(18);
    expect(sumTimeLogHours(logs, 'p2')).toBe(4);
    expect(sumTimeLogHours(logs, 'nope')).toBe(0);
  });

  it('prefers logged hours over the manual actual_hours field', () => {
    const project = makeProject({ id: 'p1', actualHours: 99 });
    expect(effectiveHoursForProject(project, logs)).toBe(18);
  });

  it('falls back to manual actual_hours when no logs exist', () => {
    const project = makeProject({ id: 'nolog', actualHours: 12 });
    expect(effectiveHoursForProject(project, logs)).toBe(12);
  });
});

describe('calculateLeadSourceRoi', () => {
  it('groups project count and committed revenue by lead source', () => {
    const projects = [
      makeProject({ id: 'a', leadSource: 'instagram', agreedPrice: 4500, date: '2026-02-01' }),
      makeProject({ id: 'b', leadSource: 'instagram', agreedPrice: 2000, date: '2026-03-01' }),
      makeProject({ id: 'c', leadSource: 'designer', agreedPrice: 1600, date: '2026-02-15' }),
      makeProject({ id: 'd', leadSource: undefined, agreedPrice: 999, date: '2026-02-15' }),
    ];
    const rows = calculateLeadSourceRoi(projects);
    expect(rows).toEqual([
      { leadSource: 'instagram', count: 2, revenue: 6500 },
      { leadSource: 'designer', count: 1, revenue: 1600 },
    ]);
  });

  it('restricts to a quarter when given', () => {
    const projects = [
      makeProject({ id: 'a', leadSource: 'instagram', agreedPrice: 4500, date: '2026-02-01' }),
      makeProject({ id: 'b', leadSource: 'instagram', agreedPrice: 2000, date: '2026-05-01' }),
    ];
    expect(calculateLeadSourceRoi(projects, '2026-Q1')).toEqual([
      { leadSource: 'instagram', count: 1, revenue: 4500 },
    ]);
  });
});

describe('calculateChannelRoi', () => {
  it('pairs marketing spend per channel with revenue from the matching lead source', () => {
    const projects = [
      makeProject({ id: 'a', leadSource: 'instagram', agreedPrice: 4500, date: '2026-02-01' }),
    ];
    const expenses: Expense[] = [
      makeExpense({ id: 'm1', category: 'marketing', channel: 'instagram', amount: 150, date: '2026-02-08' }),
      makeExpense({ id: 'm2', category: 'marketing', channel: 'facebook_group', amount: 50, date: '2026-02-09' }),
      makeExpense({ id: 'x', category: 'materials', amount: 999, date: '2026-02-10' }),
    ];
    const rows = calculateChannelRoi(projects, expenses);
    expect(rows).toContainEqual({ channel: 'instagram', spend: 150, revenue: 4500 });
    expect(rows).toContainEqual({ channel: 'facebook_group', spend: 50, revenue: 0 });
    // materials expense must not create a channel row
    expect(rows.find((r) => r.channel === undefined)).toBeUndefined();
    expect(rows).toHaveLength(2);
  });
});

describe('aggregateProfitByGroup', () => {
  it('aggregates count, averages, effective rate, and total profit per key', () => {
    const rows = aggregateProfitByGroup([
      { key: 'table', agreedPrice: 4500, materialsCost: 600, linkedExpenses: 300, hours: 24 },
      { key: 'table', agreedPrice: 3500, materialsCost: 500, linkedExpenses: 0, hours: 20 },
      { key: 'shelf', agreedPrice: 1600, materialsCost: 400, linkedExpenses: 0, hours: 8 },
    ]);

    const table = rows.find((r) => r.key === 'table')!;
    expect(table.count).toBe(2);
    expect(table.avgPrice).toBe(4000);
    expect(table.totalProfit).toBe(3600 + 3000);
    // rates: (3600/24)=150, (3000/20)=150 -> avg 150
    expect(table.avgRate).toBe(150);

    // sorted by total profit desc
    expect(rows[0].key).toBe('table');
  });

  it('reports a null average rate when no item has hours', () => {
    const rows = aggregateProfitByGroup([
      { key: 'x', agreedPrice: 1000, materialsCost: 200, linkedExpenses: 0, hours: 0 },
    ]);
    expect(rows[0].avgRate).toBeNull();
  });
});
