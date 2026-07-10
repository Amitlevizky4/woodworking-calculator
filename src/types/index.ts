export type Unit = 'meter' | 'sheet' | 'liter' | 'piece' | 'kg' | 'm2';
export type Status = 'planning' | 'in-progress' | 'completed' | 'on-hold';
export type MarkupAppliedTo = 'materials' | 'materials+labor';

export type ExpenseCategory =
  | 'workshop_rent'
  | 'materials'
  | 'consumables'
  | 'tools'
  | 'insurance'
  | 'marketing'
  | 'transport'
  | 'fees'
  | 'other';

export type LeadSource =
  | 'instagram'
  | 'facebook_group'
  | 'marketplace'
  | 'word_of_mouth'
  | 'designer'
  | 'friends_family'
  | 'other';

export interface MaterialVariant {
  id: string;
  label: string;
  price: number;
}

export interface Material {
  id: string;
  name: string;
  categoryId: string;
  unit: Unit;
  basePrice: number;
  variants?: MaterialVariant[];
  description?: string;
  photoUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
}

export interface ProjectMaterial {
  materialId: string;
  variantId?: string;
  quantity: number;
}

export interface WoodPart {
  id: string;
  name: string;
  lengthMm: number;
  widthMm: number;
  quantity: number;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  description?: string;
  date: string;
  status: Status;
  buyerName?: string;
  platform?: string;
  materials: ProjectMaterial[];
  woodParts: WoodPart[];
  laborHours: number;
  hourlyRate: number;
  markupFactor: number;
  markupAppliedTo: MarkupAppliedTo;
  discountPercent: number;
  photoUrl?: string;
  // Income & payment tracking (Phase 1)
  quotedPrice?: number;
  agreedPrice?: number;
  depositAmount?: number;
  depositPaidAt?: string;
  balancePaidAt?: string;
  deliveredAt?: string;
  actualHours?: number;
  leadSource?: LeadSource;
  createdAt: string;
  updatedAt: string;
}

export interface Template
  extends Omit<
    Project,
    | 'date'
    | 'status'
    | 'buyerName'
    | 'platform'
    | 'photoUrl'
    | 'quotedPrice'
    | 'agreedPrice'
    | 'depositAmount'
    | 'depositPaidAt'
    | 'balancePaidAt'
    | 'deliveredAt'
    | 'actualHours'
    | 'leadSource'
  > {
  templateName: string;
  templateDescription?: string;
}

export type ShopRole = 'manager' | 'member';

export interface Shop {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopMember {
  id: string;
  shopId: string;
  userId: string;
  role: ShopRole;
  joinedAt: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface Invitation {
  id: string;
  shopId: string;
  token: string;
  createdBy: string;
  expiresAt: string;
  maxUses?: number;
  useCount: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  supplier?: string;
  description?: string;
  projectId?: string;
  receiptUrl?: string;
  recurringId?: string;
  periodMonth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringExpense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  supplier?: string;
  description?: string;
  dayOfMonth: number;
  active: boolean;
  startMonth: string;
  createdAt: string;
}

export interface ShopSettings {
  monthlyProfitTarget: number;
  vatExemptCeiling: number;
  targetHourlyRate: number;
  weeklyHoursBudget: number;
}

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  monthlyProfitTarget: 3500,
  vatExemptCeiling: 122833,
  targetHourlyRate: 150,
  weeklyHoursBudget: 25,
};
