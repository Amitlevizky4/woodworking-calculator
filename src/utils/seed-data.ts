import { v4 as uuidv4 } from 'uuid';
import type {
  Category,
  Material,
  Project,
  Template,
} from '@/types';

interface SeedData {
  categories: Category[];
  materials: Material[];
  projects: Project[];
  templates: Template[];
}

export function seedData(): SeedData {
  const woodCategoryId = uuidv4();
  const finishesCategoryId = uuidv4();
  const hardwareCategoryId = uuidv4();

  const plywoodId = uuidv4();
  const pineBoardId = uuidv4();
  const oakBoardId = uuidv4();
  const woodStainId = uuidv4();
  const woodScrewsId = uuidv4();
  const sandpaperId = uuidv4();

  const plywoodStandardVariantId = uuidv4();
  const plywoodPremiumVariantId = uuidv4();
  const pine2x4VariantId = uuidv4();
  const pine2x6VariantId = uuidv4();
  const screws30mmVariantId = uuidv4();
  const screws50mmVariantId = uuidv4();
  const screws70mmVariantId = uuidv4();
  const sandpaper80VariantId = uuidv4();
  const sandpaper120VariantId = uuidv4();
  const sandpaper220VariantId = uuidv4();

  const categories: Category[] = [
    { id: woodCategoryId, name: 'Wood', color: '#8B5E3C' },
    { id: finishesCategoryId, name: 'Finishes', color: '#4A7C6F' },
    { id: hardwareCategoryId, name: 'Hardware', color: '#6B7C5C' },
  ];

  const materials: Material[] = [
    {
      id: plywoodId,
      name: 'Plywood 18mm',
      categoryId: woodCategoryId,
      unit: 'sheet',
      basePrice: 185,
      variants: [
        { id: plywoodStandardVariantId, label: 'Standard', price: 185 },
        { id: plywoodPremiumVariantId, label: 'Premium Birch', price: 245 },
      ],
    },
    {
      id: pineBoardId,
      name: 'Pine Board',
      categoryId: woodCategoryId,
      unit: 'meter',
      basePrice: 45,
      variants: [
        { id: pine2x4VariantId, label: '2x4', price: 45 },
        { id: pine2x6VariantId, label: '2x6', price: 65 },
      ],
    },
    {
      id: oakBoardId,
      name: 'Oak Board',
      categoryId: woodCategoryId,
      unit: 'meter',
      basePrice: 120,
    },
    {
      id: woodStainId,
      name: 'Wood Stain',
      categoryId: finishesCategoryId,
      unit: 'liter',
      basePrice: 85,
    },
    {
      id: woodScrewsId,
      name: 'Wood Screws',
      categoryId: hardwareCategoryId,
      unit: 'piece',
      basePrice: 0.5,
      variants: [
        { id: screws30mmVariantId, label: '30mm', price: 0.5 },
        { id: screws50mmVariantId, label: '50mm', price: 0.75 },
        { id: screws70mmVariantId, label: '70mm', price: 1.0 },
      ],
    },
    {
      id: sandpaperId,
      name: 'Sandpaper',
      categoryId: hardwareCategoryId,
      unit: 'piece',
      basePrice: 8,
      variants: [
        { id: sandpaper80VariantId, label: '80 Grit', price: 8 },
        { id: sandpaper120VariantId, label: '120 Grit', price: 8 },
        { id: sandpaper220VariantId, label: '220 Grit', price: 10 },
      ],
    },
  ];

  const now = new Date().toISOString();

  const projects: Project[] = [
    {
      id: uuidv4(),
      name: 'Walnut Dining Table',
      type: 'table',
      description: 'Custom walnut dining table for 6 people',
      date: '2026-02-15',
      status: 'completed',
      buyerName: 'David Cohen',
      materials: [
        { materialId: plywoodId, variantId: plywoodStandardVariantId, quantity: 2 },
        { materialId: pineBoardId, variantId: pine2x4VariantId, quantity: 4 },
        { materialId: woodStainId, quantity: 1 },
        { materialId: woodScrewsId, variantId: screws30mmVariantId, quantity: 50 },
      ],
      woodParts: [
        { id: uuidv4(), name: 'Top', lengthMm: 1800, widthMm: 900, quantity: 1 },
        { id: uuidv4(), name: 'Leg', lengthMm: 100, widthMm: 700, quantity: 4 },
        { id: uuidv4(), name: 'Support Beam', lengthMm: 1600, widthMm: 100, quantity: 2 },
      ],
      laborHours: 24,
      hourlyRate: 150,
      markupFactor: 1.3,
      markupAppliedTo: 'materials+labor',
      discountPercent: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      name: 'Floating Shelves Set',
      type: 'shelf',
      description: 'Set of 4 floating oak shelves with hidden brackets',
      date: '2026-03-20',
      status: 'in-progress',
      materials: [
        { materialId: oakBoardId, quantity: 3 },
        { materialId: sandpaperId, variantId: sandpaper120VariantId, quantity: 5 },
        { materialId: woodStainId, quantity: 0.5 },
      ],
      woodParts: [
        { id: uuidv4(), name: 'Shelf', lengthMm: 800, widthMm: 300, quantity: 4 },
        { id: uuidv4(), name: 'Bracket', lengthMm: 50, widthMm: 300, quantity: 8 },
      ],
      laborHours: 8,
      hourlyRate: 150,
      markupFactor: 1.2,
      markupAppliedTo: 'materials',
      discountPercent: 0,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const templates: Template[] = [
    {
      id: uuidv4(),
      name: 'Basic Shelf Unit',
      templateName: 'Basic Shelf Unit',
      templateDescription: 'Simple shelf unit with 3 shelves and 2 side panels',
      type: 'shelf',
      materials: [
        { materialId: pineBoardId, variantId: pine2x4VariantId, quantity: 6 },
        { materialId: woodScrewsId, variantId: screws30mmVariantId, quantity: 40 },
        { materialId: sandpaperId, variantId: sandpaper120VariantId, quantity: 3 },
      ],
      woodParts: [
        { id: uuidv4(), name: 'Shelf', lengthMm: 600, widthMm: 250, quantity: 3 },
        { id: uuidv4(), name: 'Side Panel', lengthMm: 600, widthMm: 300, quantity: 2 },
      ],
      laborHours: 6,
      hourlyRate: 150,
      markupFactor: 1.25,
      markupAppliedTo: 'materials+labor',
      discountPercent: 0,
      createdAt: now,
      updatedAt: now,
    },
  ];

  return { categories, materials, projects, templates };
}
