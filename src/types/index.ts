export type Unit = 'meter' | 'sheet' | 'liter' | 'piece' | 'kg' | 'm2';
export type Status = 'planning' | 'in-progress' | 'completed' | 'on-hold';
export type MarkupAppliedTo = 'materials' | 'materials+labor';

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
  createdAt: string;
  updatedAt: string;
}

export interface Template
  extends Omit<
    Project,
    'date' | 'status' | 'buyerName' | 'platform' | 'photoUrl'
  > {
  templateName: string;
  templateDescription?: string;
}
