import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useBusinessStore } from '@/stores/useBusinessStore';
import { useStore } from '@/stores/useStore';
import { useTranslation } from '@/i18n/useTranslation';
import { Icon } from '@/components/Icon';
import { formatCurrency } from '@/utils/cost-calculator';
import { missingRecurringPeriods, monthKeyOf } from '@/utils/business-metrics';
import type {
  Expense,
  ExpenseCategory,
  RecurringExpense,
} from '@/types';

const CATEGORIES: readonly ExpenseCategory[] = [
  'workshop_rent',
  'materials',
  'consumables',
  'tools',
  'insurance',
  'marketing',
  'transport',
  'fees',
  'other',
];

// Channels align with lead-source values so marketing spend can be matched to
// revenue by channel in Reports.
const CHANNELS = [
  'instagram',
  'facebook_group',
  'marketplace',
  'word_of_mouth',
  'designer',
  'friends_family',
  'other',
] as const;

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const INPUT_CLASS =
  'w-full bg-surface-container-highest border-b-2 border-outline focus:border-primary focus:ring-0 px-4 py-3 outline-none rounded-t-md text-on-surface';

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// ============================================
// Expense add/edit modal
// ============================================

interface ExpenseFormState {
  date: string;
  amount: string;
  category: ExpenseCategory;
  supplier: string;
  description: string;
  projectId: string;
  channel: string;
}

function ExpenseModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Expense | null;
  onSave: (expense: Expense) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const projects = useStore((s) => s.projects);

  const [form, setForm] = useState<ExpenseFormState>({
    date: initial?.date ?? todayIso(),
    amount: initial ? String(initial.amount) : '',
    category: initial?.category ?? 'materials',
    supplier: initial?.supplier ?? '',
    description: initial?.description ?? '',
    projectId: initial?.projectId ?? '',
    channel: initial?.channel ?? '',
  });

  const set = (patch: Partial<ExpenseFormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = () => {
    const now = new Date().toISOString();
    onSave({
      id: initial?.id ?? uuidv4(),
      date: form.date,
      amount: parseFloat(form.amount) || 0,
      category: form.category,
      supplier: form.supplier || undefined,
      description: form.description || undefined,
      projectId: form.projectId || undefined,
      channel: form.category === 'marketing' ? form.channel || undefined : undefined,
      receiptUrl: initial?.receiptUrl,
      recurringId: initial?.recurringId,
      periodMonth: initial?.periodMonth,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-surface-container-low rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg font-bold uppercase tracking-wide">
            {initial ? t('expenses.editExpense') : t('expenses.addExpense')}
          </h2>
          <button onClick={onClose} className="text-secondary hover:text-error">
            <Icon name="close" className="text-xl" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
              {t('expenses.date')}
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set({ date: e.target.value })}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
              {t('expenses.amount')}
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => set({ amount: e.target.value })}
              min={0}
              step="0.01"
              className={`${INPUT_CLASS} font-mono`}
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
            {t('expenses.category')}
          </label>
          <select
            value={form.category}
            onChange={(e) => set({ category: e.target.value as ExpenseCategory })}
            className={INPUT_CLASS}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`expenseCategory.${c}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
            {t('expenses.supplier')}
          </label>
          <input
            type="text"
            value={form.supplier}
            onChange={(e) => set({ supplier: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
            {t('expenses.description')}
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>

        {form.category === 'marketing' && (
          <div>
            <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
              {t('reports.channelRoi')}
            </label>
            <select
              value={form.channel}
              onChange={(e) => set({ channel: e.target.value })}
              className={INPUT_CLASS}
            >
              <option value="">{t('expenses.noProject')}</option>
              {CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {t(`leadSource.${c}`)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
            {t('expenses.linkedProject')}
          </label>
          <select
            value={form.projectId}
            onChange={(e) => set({ projectId: e.target.value })}
            className={INPUT_CLASS}
          >
            <option value="">{t('expenses.noProject')}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Icon name="save" className="text-lg" />
            {t('common.save')}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-medium border border-outline-variant hover:bg-surface-container transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Recurring rule add/edit modal
// ============================================

interface RecurringFormState {
  amount: string;
  category: ExpenseCategory;
  supplier: string;
  description: string;
  dayOfMonth: string;
  active: boolean;
}

function RecurringModal({
  initial,
  onSave,
  onClose,
}: {
  initial: RecurringExpense | null;
  onSave: (rule: RecurringExpense) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const [form, setForm] = useState<RecurringFormState>({
    amount: initial ? String(initial.amount) : '',
    category: initial?.category ?? 'workshop_rent',
    supplier: initial?.supplier ?? '',
    description: initial?.description ?? '',
    dayOfMonth: initial ? String(initial.dayOfMonth) : '1',
    active: initial?.active ?? true,
  });

  const set = (patch: Partial<RecurringFormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = () => {
    const now = new Date().toISOString();
    const day = Math.min(28, Math.max(1, parseInt(form.dayOfMonth, 10) || 1));
    onSave({
      id: initial?.id ?? uuidv4(),
      amount: parseFloat(form.amount) || 0,
      category: form.category,
      supplier: form.supplier || undefined,
      description: form.description || undefined,
      dayOfMonth: day,
      active: form.active,
      startMonth: initial?.startMonth ?? `${monthKeyOf(todayIso())}-01`,
      createdAt: initial?.createdAt ?? now,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-surface-container-low rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg font-bold uppercase tracking-wide">
            {t('expenses.addRecurring')}
          </h2>
          <button onClick={onClose} className="text-secondary hover:text-error">
            <Icon name="close" className="text-xl" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
              {t('expenses.amount')}
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => set({ amount: e.target.value })}
              min={0}
              step="0.01"
              className={`${INPUT_CLASS} font-mono`}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
              {t('expenses.dayOfMonth')}
            </label>
            <input
              type="number"
              value={form.dayOfMonth}
              onChange={(e) => set({ dayOfMonth: e.target.value })}
              min={1}
              max={28}
              className={`${INPUT_CLASS} font-mono`}
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
            {t('expenses.category')}
          </label>
          <select
            value={form.category}
            onChange={(e) => set({ category: e.target.value as ExpenseCategory })}
            className={INPUT_CLASS}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`expenseCategory.${c}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
            {t('expenses.supplier')}
          </label>
          <input
            type="text"
            value={form.supplier}
            onChange={(e) => set({ supplier: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
            {t('expenses.description')}
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set({ active: e.target.checked })}
            className="accent-primary w-4 h-4"
          />
          <span className="text-sm text-on-surface">{t('expenses.active')}</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Icon name="save" className="text-lg" />
            {t('common.save')}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-medium border border-outline-variant hover:bg-surface-container transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main page
// ============================================

export function Expenses() {
  const { t } = useTranslation();
  const expenses = useBusinessStore((s) => s.expenses);
  const recurringExpenses = useBusinessStore((s) => s.recurringExpenses);
  const addExpense = useBusinessStore((s) => s.addExpense);
  const updateExpense = useBusinessStore((s) => s.updateExpense);
  const deleteExpense = useBusinessStore((s) => s.deleteExpense);
  const addRecurringExpense = useBusinessStore((s) => s.addRecurringExpense);
  const updateRecurringExpense = useBusinessStore((s) => s.updateRecurringExpense);
  const deleteRecurringExpense = useBusinessStore((s) => s.deleteRecurringExpense);
  const generateRecurringExpenses = useBusinessStore((s) => s.generateRecurringExpenses);
  const projects = useStore((s) => s.projects);

  const [monthFilter, setMonthFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expenseModal, setExpenseModal] = useState<{ open: boolean; editing: Expense | null }>({
    open: false,
    editing: null,
  });
  const [recurringModal, setRecurringModal] = useState<{ open: boolean; editing: RecurringExpense | null }>({
    open: false,
    editing: null,
  });

  const projectName = (id?: string) =>
    id ? (projects.find((p) => p.id === id)?.name ?? '') : '';

  const monthOptions = useMemo(() => {
    const set = new Set(expenses.map((e) => monthKeyOf(e.date)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [expenses]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (monthFilter !== 'all' && monthKeyOf(e.date) !== monthFilter) return false;
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      return true;
    });
  }, [expenses, monthFilter, categoryFilter]);

  const total = useMemo(
    () => filtered.reduce((sum, e) => sum + e.amount, 0),
    [filtered],
  );

  const pendingRecurringCount = useMemo(() => {
    const currentMonth = monthKeyOf(todayIso());
    return recurringExpenses.reduce((count, rule) => {
      const existing = new Set(
        expenses
          .filter((e) => e.recurringId === rule.id && e.periodMonth)
          .map((e) => monthKeyOf(e.periodMonth as string)),
      );
      return count + missingRecurringPeriods(rule, existing, currentMonth).length;
    }, 0);
  }, [recurringExpenses, expenses]);

  const handleExportCsv = () => {
    const header = ['Date', 'Category', 'Amount', 'Supplier', 'Description', 'Project'];
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = filtered.map((e) =>
      [
        e.date,
        t(`expenseCategory.${e.category}`),
        String(e.amount),
        e.supplier ?? '',
        e.description ?? '',
        projectName(e.projectId),
      ]
        .map(escape)
        .join(','),
    );
    // UTF-8 BOM so Hebrew opens correctly in Excel.
    const csv = '﻿' + [header.map(escape).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${monthFilter === 'all' ? 'all' : monthFilter}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    await generateRecurringExpenses();
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-headline text-3xl font-bold text-on-surface">
          {t('expenses.title')}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
          >
            <Icon name="download" className="text-base" />
            {t('expenses.exportCsv')}
          </button>
          <button
            onClick={() => setExpenseModal({ open: true, editing: null })}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Icon name="add" className="text-lg" />
            {t('expenses.addExpense')}
          </button>
        </div>
      </div>

      {pendingRecurringCount > 0 && (
        <div className="flex items-center justify-between gap-4 bg-tertiary-container text-on-tertiary-container rounded-xl p-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Icon name="event_repeat" className="text-xl" />
            <span className="text-sm font-medium">
              {pendingRecurringCount} {t('expenses.pendingRecurring')}
            </span>
          </div>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Icon name="playlist_add_check" className="text-lg" />
            {t('expenses.generateNow')}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="bg-surface-container-highest border-b-2 border-outline focus:border-primary outline-none px-4 py-2 rounded-t-md text-sm"
        >
          <option value="all">{t('expenses.allMonths')}</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {formatMonthLabel(m)}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-surface-container-highest border-b-2 border-outline focus:border-primary outline-none px-4 py-2 rounded-t-md text-sm"
        >
          <option value="all">{t('expenses.allCategories')}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(`expenseCategory.${c}`)}
            </option>
          ))}
        </select>
        <div className="ms-auto text-sm text-secondary">
          {t('expenses.total')}:{' '}
          <span className="font-mono font-bold text-on-surface">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Expenses table */}
      <div className="bg-surface-container-low rounded-xl overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-outline-variant/30">
              <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
                {t('expenses.date')}
              </th>
              <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
                {t('expenses.category')}
              </th>
              <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
                {t('expenses.supplier')}
              </th>
              <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
                {t('expenses.linkedProject')}
              </th>
              <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
                {t('expenses.amount')}
              </th>
              <th className="px-4 py-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-b border-outline-variant/20">
                <td className="px-4 py-3 font-mono text-sm">{e.date}</td>
                <td className="px-4 py-3 text-sm">
                  {t(`expenseCategory.${e.category}`)}
                  {e.recurringId && (
                    <Icon
                      name="event_repeat"
                      className="text-sm text-secondary ms-1 align-middle"
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-secondary">
                  {e.supplier ?? '--'}
                </td>
                <td className="px-4 py-3 text-sm text-secondary">
                  {projectName(e.projectId) || '--'}
                </td>
                <td className="px-4 py-3 text-end font-mono font-bold">
                  {formatCurrency(e.amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setExpenseModal({ open: true, editing: e })}
                      className="text-secondary hover:text-primary transition-colors"
                    >
                      <Icon name="edit" className="text-base" />
                    </button>
                    <button
                      onClick={() => deleteExpense(e.id)}
                      className="text-secondary hover:text-error transition-colors"
                    >
                      <Icon name="delete" className="text-base" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-secondary">
                  {t('expenses.noExpenses')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Recurring rules */}
      <div className="bg-surface-container rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg font-bold uppercase tracking-wide">
            {t('expenses.recurringRules')}
          </h2>
          <button
            onClick={() => setRecurringModal({ open: true, editing: null })}
            className="flex items-center gap-2 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Icon name="add" className="text-lg" />
            {t('expenses.addRecurring')}
          </button>
        </div>
        {recurringExpenses.length === 0 ? (
          <p className="text-secondary text-sm">{t('expenses.noExpenses')}</p>
        ) : (
          <div className="space-y-2">
            {recurringExpenses.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between gap-4 bg-surface-container-low rounded-lg px-4 py-3 flex-wrap"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold">
                    {formatCurrency(rule.amount)}
                  </span>
                  <span className="text-sm text-secondary">
                    {t(`expenseCategory.${rule.category}`)}
                  </span>
                  <span className="text-xs text-secondary">
                    · {t('expenses.dayOfMonth')} {rule.dayOfMonth}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      rule.active
                        ? 'bg-tertiary/10 text-tertiary'
                        : 'bg-surface-variant text-secondary'
                    }`}
                  >
                    {rule.active ? t('expenses.active') : t('expenses.inactive')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRecurringModal({ open: true, editing: rule })}
                    className="text-secondary hover:text-primary transition-colors"
                  >
                    <Icon name="edit" className="text-base" />
                  </button>
                  <button
                    onClick={() => deleteRecurringExpense(rule.id)}
                    className="text-secondary hover:text-error transition-colors"
                  >
                    <Icon name="delete" className="text-base" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {expenseModal.open && (
        <ExpenseModal
          initial={expenseModal.editing}
          onClose={() => setExpenseModal({ open: false, editing: null })}
          onSave={(expense) => {
            if (expenseModal.editing) {
              updateExpense(expense);
            } else {
              addExpense(expense);
            }
            setExpenseModal({ open: false, editing: null });
          }}
        />
      )}

      {recurringModal.open && (
        <RecurringModal
          initial={recurringModal.editing}
          onClose={() => setRecurringModal({ open: false, editing: null })}
          onSave={(rule) => {
            if (recurringModal.editing) {
              updateRecurringExpense(rule);
            } else {
              addRecurringExpense(rule);
            }
            setRecurringModal({ open: false, editing: null });
          }}
        />
      )}
    </div>
  );
}
