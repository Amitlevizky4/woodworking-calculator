import { describe, it, expect } from 'vitest';
import type { Material, ProjectMaterial } from '@/types';
import { summarizeMaterialUsage } from '@/utils/cost-calculator';

const materials: Material[] = [
  {
    id: 'pine',
    name: 'Pine Board',
    categoryId: 'wood',
    unit: 'meter',
    basePrice: 9.8,
    variants: [
      { id: 'v-4x4', label: '4×4', price: 9.8 },
      { id: 'v-2x4', label: '2×4', price: 4.9 },
    ],
  },
  {
    id: 'oak',
    name: 'Oak Board',
    categoryId: 'wood',
    unit: 'meter',
    basePrice: 120,
  },
];

function line(overrides: Partial<ProjectMaterial>): ProjectMaterial {
  return { id: 'row', materialId: 'pine', quantity: 1, ...overrides };
}

describe('summarizeMaterialUsage', () => {
  it('sums quantity and cost across separate rows of the same material', () => {
    // Arrange — two 4.2m pine boards entered as separate line items
    const inputRows = [
      line({ id: 'r1', materialId: 'pine', variantId: 'v-4x4', quantity: 4.2 }),
      line({ id: 'r2', materialId: 'pine', variantId: 'v-4x4', quantity: 4.2 }),
    ];

    // Act
    const actual = summarizeMaterialUsage(inputRows, materials);

    // Assert — one aggregated row of 8.4m
    const expectedRow = {
      materialId: 'pine',
      name: 'Pine Board',
      unit: 'meter',
      totalQuantity: 8.4,
      totalCost: 8.4 * 9.8,
    };
    expect(actual).toHaveLength(1);
    expect(actual[0]).toEqual(expectedRow);
  });

  it('keeps different materials as separate summary rows', () => {
    const inputRows = [
      line({ id: 'r1', materialId: 'pine', variantId: 'v-2x4', quantity: 2 }),
      line({ id: 'r2', materialId: 'oak', quantity: 3 }),
    ];

    const actual = summarizeMaterialUsage(inputRows, materials);

    expect(actual).toHaveLength(2);
    expect(actual.find((r) => r.materialId === 'pine')?.totalCost).toBe(2 * 4.9);
    expect(actual.find((r) => r.materialId === 'oak')?.totalCost).toBe(3 * 120);
  });

  it('ignores line items whose material no longer exists', () => {
    const inputRows = [line({ id: 'r1', materialId: 'ghost', quantity: 5 })];
    expect(summarizeMaterialUsage(inputRows, materials)).toEqual([]);
  });
});
