import type { Material, MarkupAppliedTo, ProjectMaterial } from '@/types';

interface CostBreakdown {
  materialsCost: number;
  laborCost: number;
  subtotal: number;
  markupAmount: number;
  afterMarkup: number;
  discountAmount: number;
  finalPrice: number;
}

interface CalculateFinalPriceInput {
  materialsCost: number;
  laborCost: number;
  markupFactor: number;
  markupAppliedTo: MarkupAppliedTo;
  discountPercent: number;
}

interface CalculateMarkupInput {
  subtotal: number;
  materialsCost: number;
  laborCost: number;
  markupFactor: number;
  markupAppliedTo: MarkupAppliedTo;
}

export function calculateMaterialsCost(
  projectMaterials: ProjectMaterial[],
  allMaterials: Material[],
): number {
  return projectMaterials.reduce((total, pm) => {
    const material = allMaterials.find((m) => m.id === pm.materialId);
    if (!material) return total;

    if (pm.variantId && material.variants) {
      const variant = material.variants.find((v) => v.id === pm.variantId);
      if (variant) return total + variant.price * pm.quantity;
    }

    return total + material.basePrice * pm.quantity;
  }, 0);
}

export function calculateLaborCost(hours: number, rate: number): number {
  return hours * rate;
}

export function calculateSubtotal(
  materialsCost: number,
  laborCost: number,
): number {
  return materialsCost + laborCost;
}

export function calculateMarkup(input: CalculateMarkupInput): number {
  const { materialsCost, laborCost, markupFactor, markupAppliedTo } = input;
  const markupMultiplier = markupFactor - 1;

  if (markupAppliedTo === 'materials') {
    return materialsCost * markupMultiplier;
  }

  return (materialsCost + laborCost) * markupMultiplier;
}

export function calculateDiscount(
  afterMarkup: number,
  discountPercent: number,
): number {
  return afterMarkup * (discountPercent / 100);
}

export function calculateFinalPrice(
  input: CalculateFinalPriceInput,
): CostBreakdown {
  const { materialsCost, laborCost, markupFactor, markupAppliedTo, discountPercent } = input;

  const subtotal = calculateSubtotal(materialsCost, laborCost);
  const markupAmount = calculateMarkup({
    subtotal,
    materialsCost,
    laborCost,
    markupFactor,
    markupAppliedTo,
  });
  const afterMarkup = subtotal + markupAmount;
  const discountAmount = calculateDiscount(afterMarkup, discountPercent);
  const finalPrice = afterMarkup - discountAmount;

  return {
    materialsCost,
    laborCost,
    subtotal,
    markupAmount,
    afterMarkup,
    discountAmount,
    finalPrice,
  };
}

export function formatCurrency(amount: number): string {
  return `\u20AA${amount.toLocaleString('en-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
