import { create } from 'zustand';
import type { Expense, RecurringExpense, ShopSettings } from '@/types';
import { DEFAULT_SHOP_SETTINGS } from '@/types';
import { supabase } from '@/lib/supabase';
import { useShopStore } from '@/stores/useShopStore';
import {
  missingRecurringPeriods,
  monthKeyOf,
  recurringExpenseDate,
} from '@/utils/business-metrics';

interface BusinessState {
  expenses: Expense[];
  recurringExpenses: RecurringExpense[];
  settings: ShopSettings;
  loading: boolean;

  fetchAll: () => Promise<void>;

  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addRecurringExpense: (rule: RecurringExpense) => Promise<void>;
  updateRecurringExpense: (rule: RecurringExpense) => Promise<void>;
  deleteRecurringExpense: (id: string) => Promise<void>;

  updateSettings: (settings: ShopSettings) => Promise<void>;

  /** Materializes any missing monthly instances of active recurring rules.
   *  Returns the number of expense rows created. */
  generateRecurringExpenses: () => Promise<number>;

  reset: () => void;
}

function getActiveShopId(): string | null {
  return useShopStore.getState().activeShopId;
}

async function getUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
}

function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

function mapDbExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    date: row.date as string,
    amount: row.amount as number,
    category: row.category as Expense['category'],
    supplier: (row.supplier as string) ?? undefined,
    description: (row.description as string) ?? undefined,
    projectId: (row.project_id as string) ?? undefined,
    channel: (row.channel as string) ?? undefined,
    receiptUrl: (row.receipt_url as string) ?? undefined,
    recurringId: (row.recurring_id as string) ?? undefined,
    periodMonth: (row.period_month as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapDbRecurring(row: Record<string, unknown>): RecurringExpense {
  return {
    id: row.id as string,
    amount: row.amount as number,
    category: row.category as RecurringExpense['category'],
    supplier: (row.supplier as string) ?? undefined,
    description: (row.description as string) ?? undefined,
    dayOfMonth: row.day_of_month as number,
    active: row.active as boolean,
    startMonth: row.start_month as string,
    createdAt: row.created_at as string,
  };
}

function mapDbSettings(row: Record<string, unknown>): ShopSettings {
  return {
    monthlyProfitTarget: row.monthly_profit_target as number,
    vatExemptCeiling: row.vat_exempt_ceiling as number,
    targetHourlyRate: row.target_hourly_rate as number,
    weeklyHoursBudget: row.weekly_hours_budget as number,
  };
}

export const useBusinessStore = create<BusinessState>()((set, get) => ({
  expenses: [],
  recurringExpenses: [],
  settings: DEFAULT_SHOP_SETTINGS,
  loading: false,

  fetchAll: async () => {
    try {
      set({ loading: true });

      const shopId = getActiveShopId();
      if (!shopId) {
        set({
          expenses: [],
          recurringExpenses: [],
          settings: DEFAULT_SHOP_SETTINGS,
          loading: false,
        });
        return;
      }

      const [expensesRes, recurringRes, settingsRes] = await Promise.all([
        supabase
          .from('expenses')
          .select('*')
          .eq('shop_id', shopId)
          .order('date', { ascending: false }),
        supabase.from('recurring_expenses').select('*').eq('shop_id', shopId),
        supabase
          .from('shop_settings')
          .select('*')
          .eq('shop_id', shopId)
          .maybeSingle(),
      ]);

      const expenses: Expense[] = (expensesRes.data ?? []).map((row) =>
        mapDbExpense(row as Record<string, unknown>),
      );
      const recurringExpenses: RecurringExpense[] = (
        recurringRes.data ?? []
      ).map((row) => mapDbRecurring(row as Record<string, unknown>));
      const settings = settingsRes.data
        ? mapDbSettings(settingsRes.data as Record<string, unknown>)
        : DEFAULT_SHOP_SETTINGS;

      set({ expenses, recurringExpenses, settings, loading: false });
    } catch (error) {
      console.error('Failed to fetch business data from Supabase:', error);
      set({ loading: false });
    }
  },

  addExpense: async (expense) => {
    try {
      const shopId = getActiveShopId();
      if (!shopId) return;
      const userId = await getUserId();

      const { error } = await supabase.from('expenses').insert({
        id: expense.id,
        shop_id: shopId,
        created_by: userId,
        date: expense.date,
        amount: expense.amount,
        category: expense.category,
        supplier: expense.supplier ?? null,
        description: expense.description ?? null,
        project_id: expense.projectId ?? null,
        channel: expense.channel ?? null,
        receipt_url: expense.receiptUrl ?? null,
      });

      if (error) throw error;

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  },

  updateExpense: async (expense) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          date: expense.date,
          amount: expense.amount,
          category: expense.category,
          supplier: expense.supplier ?? null,
          description: expense.description ?? null,
          project_id: expense.projectId ?? null,
          channel: expense.channel ?? null,
          receipt_url: expense.receiptUrl ?? null,
        })
        .eq('id', expense.id);

      if (error) throw error;

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to update expense:', error);
    }
  },

  deleteExpense: async (id) => {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  },

  addRecurringExpense: async (rule) => {
    try {
      const shopId = getActiveShopId();
      if (!shopId) return;
      const userId = await getUserId();

      const { error } = await supabase.from('recurring_expenses').insert({
        id: rule.id,
        shop_id: shopId,
        created_by: userId,
        amount: rule.amount,
        category: rule.category,
        supplier: rule.supplier ?? null,
        description: rule.description ?? null,
        day_of_month: rule.dayOfMonth,
        active: rule.active,
      });

      if (error) throw error;

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to add recurring expense:', error);
    }
  },

  updateRecurringExpense: async (rule) => {
    try {
      const { error } = await supabase
        .from('recurring_expenses')
        .update({
          amount: rule.amount,
          category: rule.category,
          supplier: rule.supplier ?? null,
          description: rule.description ?? null,
          day_of_month: rule.dayOfMonth,
          active: rule.active,
        })
        .eq('id', rule.id);

      if (error) throw error;

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to update recurring expense:', error);
    }
  },

  deleteRecurringExpense: async (id) => {
    try {
      const { error } = await supabase
        .from('recurring_expenses')
        .delete()
        .eq('id', id);
      if (error) throw error;

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to delete recurring expense:', error);
    }
  },

  updateSettings: async (settings) => {
    try {
      const shopId = getActiveShopId();
      if (!shopId) return;

      const { error } = await supabase.from('shop_settings').upsert({
        shop_id: shopId,
        monthly_profit_target: settings.monthlyProfitTarget,
        vat_exempt_ceiling: settings.vatExemptCeiling,
        target_hourly_rate: settings.targetHourlyRate,
        weekly_hours_budget: settings.weeklyHoursBudget,
      });

      if (error) throw error;

      set({ settings });
    } catch (error) {
      console.error('Failed to update shop settings:', error);
    }
  },

  generateRecurringExpenses: async () => {
    try {
      const shopId = getActiveShopId();
      if (!shopId) return 0;
      const userId = await getUserId();

      const { recurringExpenses, expenses } = get();
      const currentMonth = currentMonthKey();

      const rows = recurringExpenses.flatMap((rule) => {
        const existing = new Set(
          expenses
            .filter((e) => e.recurringId === rule.id && e.periodMonth)
            .map((e) => monthKeyOf(e.periodMonth as string)),
        );
        return missingRecurringPeriods(rule, existing, currentMonth).map(
          (period) => ({
            shop_id: shopId,
            created_by: userId,
            date: recurringExpenseDate(period, rule.dayOfMonth),
            amount: rule.amount,
            category: rule.category,
            supplier: rule.supplier ?? null,
            description: rule.description ?? null,
            recurring_id: rule.id,
            period_month: `${period}-01`,
          }),
        );
      });

      if (rows.length === 0) return 0;

      const { error } = await supabase.from('expenses').insert(rows);
      if (error) throw error;

      await get().fetchAll();
      return rows.length;
    } catch (error) {
      console.error('Failed to generate recurring expenses:', error);
      return 0;
    }
  },

  reset: () => {
    set({
      expenses: [],
      recurringExpenses: [],
      settings: DEFAULT_SHOP_SETTINGS,
      loading: false,
    });
  },
}));
