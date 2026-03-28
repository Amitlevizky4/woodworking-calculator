import { create } from 'zustand';
import type {
  Category,
  Material,
  MaterialVariant,
  Project,
  ProjectMaterial,
  Template,
  WoodPart,
} from '@/types';
import { supabase } from '@/lib/supabase';

type Language = 'en' | 'he';

interface AppState {
  projects: Project[];
  materials: Material[];
  categories: Category[];
  templates: Template[];
  language: Language;
  loading: boolean;
  initialized: boolean;

  fetchAll: () => Promise<void>;

  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  addMaterial: (material: Material) => Promise<void>;
  updateMaterial: (material: Material) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;

  addCategory: (category: Category) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addTemplate: (template: Template) => Promise<void>;
  updateTemplate: (template: Template) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;

  toggleLanguage: () => void;
  initialize: () => Promise<void>;
}

async function getUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
}

function mapDbMaterial(row: Record<string, unknown>): Material {
  const variants = Array.isArray(row.material_variants)
    ? (row.material_variants as Record<string, unknown>[]).map(
        (v): MaterialVariant => ({
          id: v.id as string,
          label: v.label as string,
          price: v.price as number,
        }),
      )
    : undefined;

  return {
    id: row.id as string,
    name: row.name as string,
    categoryId: row.category_id as string,
    unit: row.unit as Material['unit'],
    basePrice: row.base_price as number,
    description: (row.description as string) ?? undefined,
    photoUrl: (row.photo_url as string) ?? undefined,
    variants: variants && variants.length > 0 ? variants : undefined,
  };
}

function mapDbProject(
  row: Record<string, unknown>,
  projectMaterials: Record<string, unknown>[],
  woodParts: Record<string, unknown>[],
): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as string,
    description: (row.description as string) ?? undefined,
    date: row.date as string,
    status: row.status as Project['status'],
    buyerName: (row.buyer_name as string) ?? undefined,
    platform: (row.platform as string) ?? undefined,
    laborHours: row.labor_hours as number,
    hourlyRate: row.hourly_rate as number,
    markupFactor: row.markup_factor as number,
    markupAppliedTo: row.markup_applied_to as Project['markupAppliedTo'],
    discountPercent: row.discount_percent as number,
    photoUrl: (row.photo_url as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    materials: projectMaterials
      .filter((pm) => pm.project_id === row.id)
      .map(
        (pm): ProjectMaterial => ({
          materialId: pm.material_id as string,
          variantId: (pm.variant_id as string) ?? undefined,
          quantity: pm.quantity as number,
        }),
      ),
    woodParts: woodParts
      .filter((wp) => wp.project_id === row.id)
      .map(
        (wp): WoodPart => ({
          id: wp.id as string,
          name: wp.name as string,
          lengthMm: wp.length_mm as number,
          widthMm: wp.width_mm as number,
          quantity: wp.quantity as number,
        }),
      ),
  };
}

function mapDbTemplate(
  row: Record<string, unknown>,
  templateMaterials: Record<string, unknown>[],
  templateWoodParts: Record<string, unknown>[],
): Template {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as string,
    description: (row.description as string) ?? undefined,
    templateName: row.template_name as string,
    templateDescription: (row.template_description as string) ?? undefined,
    laborHours: row.labor_hours as number,
    hourlyRate: row.hourly_rate as number,
    markupFactor: row.markup_factor as number,
    markupAppliedTo: row.markup_applied_to as Template['markupAppliedTo'],
    discountPercent: row.discount_percent as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    materials: templateMaterials
      .filter((tm) => tm.template_id === row.id)
      .map(
        (tm): ProjectMaterial => ({
          materialId: tm.material_id as string,
          variantId: (tm.variant_id as string) ?? undefined,
          quantity: tm.quantity as number,
        }),
      ),
    woodParts: templateWoodParts
      .filter((tw) => tw.template_id === row.id)
      .map(
        (tw): WoodPart => ({
          id: tw.id as string,
          name: tw.name as string,
          lengthMm: tw.length_mm as number,
          widthMm: tw.width_mm as number,
          quantity: tw.quantity as number,
        }),
      ),
  };
}

export const useStore = create<AppState>()((set, get) => ({
  projects: [],
  materials: [],
  categories: [],
  templates: [],
  language:
    (localStorage.getItem('woodworking-lang') as Language) || 'en',
  loading: false,
  initialized: false,

  fetchAll: async () => {
    try {
      set({ loading: true });

      const [
        categoriesRes,
        materialsRes,
        projectsRes,
        projectMaterialsRes,
        woodPartsRes,
        templatesRes,
        templateMaterialsRes,
        templateWoodPartsRes,
      ] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('materials').select('*, material_variants(*)'),
        supabase.from('projects').select('*'),
        supabase.from('project_materials').select('*'),
        supabase.from('wood_parts').select('*'),
        supabase.from('templates').select('*'),
        supabase.from('template_materials').select('*'),
        supabase.from('template_wood_parts').select('*'),
      ]);

      const categories: Category[] = (categoriesRes.data ?? []).map(
        (row) => ({
          id: row.id as string,
          name: row.name as string,
          description: (row.description as string) ?? undefined,
          color: row.color as string,
        }),
      );

      const materials: Material[] = (materialsRes.data ?? []).map(
        mapDbMaterial,
      );

      const projectMaterials = (projectMaterialsRes.data ??
        []) as Record<string, unknown>[];
      const woodParts = (woodPartsRes.data ?? []) as Record<
        string,
        unknown
      >[];
      const projects: Project[] = (projectsRes.data ?? []).map((row) =>
        mapDbProject(
          row as Record<string, unknown>,
          projectMaterials,
          woodParts,
        ),
      );

      const templateMaterials = (templateMaterialsRes.data ??
        []) as Record<string, unknown>[];
      const templateWoodParts = (templateWoodPartsRes.data ??
        []) as Record<string, unknown>[];
      const templates: Template[] = (templatesRes.data ?? []).map(
        (row) =>
          mapDbTemplate(
            row as Record<string, unknown>,
            templateMaterials,
            templateWoodParts,
          ),
      );

      set({ categories, materials, projects, templates, loading: false });
    } catch (error) {
      console.error('Failed to fetch data from Supabase:', error);
      set({ loading: false });
    }
  },

  addProject: async (project) => {
    try {
      const userId = await getUserId();

      const { error: projectError } = await supabase
        .from('projects')
        .insert({
          id: project.id,
          user_id: userId,
          name: project.name,
          type: project.type,
          description: project.description ?? null,
          date: project.date,
          status: project.status,
          buyer_name: project.buyerName ?? null,
          platform: project.platform ?? null,
          labor_hours: project.laborHours,
          hourly_rate: project.hourlyRate,
          markup_factor: project.markupFactor,
          markup_applied_to: project.markupAppliedTo,
          discount_percent: project.discountPercent,
          photo_url: project.photoUrl ?? null,
        });

      if (projectError) throw projectError;

      if (project.materials.length > 0) {
        const { error: materialsError } = await supabase
          .from('project_materials')
          .insert(
            project.materials.map((m) => ({
              project_id: project.id,
              material_id: m.materialId,
              variant_id: m.variantId ?? null,
              quantity: m.quantity,
            })),
          );
        if (materialsError) throw materialsError;
      }

      if (project.woodParts.length > 0) {
        const { error: partsError } = await supabase
          .from('wood_parts')
          .insert(
            project.woodParts.map((wp) => ({
              id: wp.id,
              project_id: project.id,
              name: wp.name,
              length_mm: wp.lengthMm,
              width_mm: wp.widthMm,
              quantity: wp.quantity,
            })),
          );
        if (partsError) throw partsError;
      }

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to add project:', error);
    }
  },

  updateProject: async (project) => {
    try {
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          name: project.name,
          type: project.type,
          description: project.description ?? null,
          date: project.date,
          status: project.status,
          buyer_name: project.buyerName ?? null,
          platform: project.platform ?? null,
          labor_hours: project.laborHours,
          hourly_rate: project.hourlyRate,
          markup_factor: project.markupFactor,
          markup_applied_to: project.markupAppliedTo,
          discount_percent: project.discountPercent,
          photo_url: project.photoUrl ?? null,
        })
        .eq('id', project.id);

      if (projectError) throw projectError;

      await supabase
        .from('project_materials')
        .delete()
        .eq('project_id', project.id);

      await supabase
        .from('wood_parts')
        .delete()
        .eq('project_id', project.id);

      if (project.materials.length > 0) {
        const { error: materialsError } = await supabase
          .from('project_materials')
          .insert(
            project.materials.map((m) => ({
              project_id: project.id,
              material_id: m.materialId,
              variant_id: m.variantId ?? null,
              quantity: m.quantity,
            })),
          );
        if (materialsError) throw materialsError;
      }

      if (project.woodParts.length > 0) {
        const { error: partsError } = await supabase
          .from('wood_parts')
          .insert(
            project.woodParts.map((wp) => ({
              id: wp.id,
              project_id: project.id,
              name: wp.name,
              length_mm: wp.lengthMm,
              width_mm: wp.widthMm,
              quantity: wp.quantity,
            })),
          );
        if (partsError) throw partsError;
      }

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  },

  deleteProject: async (id) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      if (error) throw error;

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  },

  addMaterial: async (material) => {
    try {
      const userId = await getUserId();

      const { error: materialError } = await supabase
        .from('materials')
        .insert({
          id: material.id,
          user_id: userId,
          name: material.name,
          category_id: material.categoryId,
          unit: material.unit,
          base_price: material.basePrice,
          description: material.description ?? null,
          photo_url: material.photoUrl ?? null,
        });

      if (materialError) throw materialError;

      if (material.variants && material.variants.length > 0) {
        const { error: variantsError } = await supabase
          .from('material_variants')
          .insert(
            material.variants.map((v) => ({
              id: v.id,
              material_id: material.id,
              label: v.label,
              price: v.price,
            })),
          );
        if (variantsError) throw variantsError;
      }

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to add material:', error);
    }
  },

  updateMaterial: async (material) => {
    try {
      const { error: materialError } = await supabase
        .from('materials')
        .update({
          name: material.name,
          category_id: material.categoryId,
          unit: material.unit,
          base_price: material.basePrice,
          description: material.description ?? null,
          photo_url: material.photoUrl ?? null,
        })
        .eq('id', material.id);

      if (materialError) throw materialError;

      await supabase
        .from('material_variants')
        .delete()
        .eq('material_id', material.id);

      if (material.variants && material.variants.length > 0) {
        const { error: variantsError } = await supabase
          .from('material_variants')
          .insert(
            material.variants.map((v) => ({
              id: v.id,
              material_id: material.id,
              label: v.label,
              price: v.price,
            })),
          );
        if (variantsError) throw variantsError;
      }

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to update material:', error);
    }
  },

  deleteMaterial: async (id) => {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);
      if (error) throw error;

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to delete material:', error);
    }
  },

  addCategory: async (category) => {
    try {
      const userId = await getUserId();

      const { error } = await supabase.from('categories').insert({
        id: category.id,
        user_id: userId,
        name: category.name,
        description: category.description ?? null,
        color: category.color,
      });

      if (error) throw error;

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  },

  updateCategory: async (category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          description: category.description ?? null,
          color: category.color,
        })
        .eq('id', category.id);

      if (error) throw error;

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  },

  deleteCategory: async (id) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  },

  addTemplate: async (template) => {
    try {
      const userId = await getUserId();

      const { error: templateError } = await supabase
        .from('templates')
        .insert({
          id: template.id,
          user_id: userId,
          name: template.name,
          template_name: template.templateName,
          template_description: template.templateDescription ?? null,
          type: template.type,
          description: template.description ?? null,
          labor_hours: template.laborHours,
          hourly_rate: template.hourlyRate,
          markup_factor: template.markupFactor,
          markup_applied_to: template.markupAppliedTo,
          discount_percent: template.discountPercent,
        });

      if (templateError) throw templateError;

      if (template.materials.length > 0) {
        const { error: materialsError } = await supabase
          .from('template_materials')
          .insert(
            template.materials.map((m) => ({
              template_id: template.id,
              material_id: m.materialId,
              variant_id: m.variantId ?? null,
              quantity: m.quantity,
            })),
          );
        if (materialsError) throw materialsError;
      }

      if (template.woodParts.length > 0) {
        const { error: partsError } = await supabase
          .from('template_wood_parts')
          .insert(
            template.woodParts.map((wp) => ({
              id: wp.id,
              template_id: template.id,
              name: wp.name,
              length_mm: wp.lengthMm,
              width_mm: wp.widthMm,
              quantity: wp.quantity,
            })),
          );
        if (partsError) throw partsError;
      }

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to add template:', error);
    }
  },

  updateTemplate: async (template) => {
    try {
      const { error: templateError } = await supabase
        .from('templates')
        .update({
          name: template.name,
          template_name: template.templateName,
          template_description: template.templateDescription ?? null,
          type: template.type,
          description: template.description ?? null,
          labor_hours: template.laborHours,
          hourly_rate: template.hourlyRate,
          markup_factor: template.markupFactor,
          markup_applied_to: template.markupAppliedTo,
          discount_percent: template.discountPercent,
        })
        .eq('id', template.id);

      if (templateError) throw templateError;

      await supabase
        .from('template_materials')
        .delete()
        .eq('template_id', template.id);

      await supabase
        .from('template_wood_parts')
        .delete()
        .eq('template_id', template.id);

      if (template.materials.length > 0) {
        const { error: materialsError } = await supabase
          .from('template_materials')
          .insert(
            template.materials.map((m) => ({
              template_id: template.id,
              material_id: m.materialId,
              variant_id: m.variantId ?? null,
              quantity: m.quantity,
            })),
          );
        if (materialsError) throw materialsError;
      }

      if (template.woodParts.length > 0) {
        const { error: partsError } = await supabase
          .from('template_wood_parts')
          .insert(
            template.woodParts.map((wp) => ({
              id: wp.id,
              template_id: template.id,
              name: wp.name,
              length_mm: wp.lengthMm,
              width_mm: wp.widthMm,
              quantity: wp.quantity,
            })),
          );
        if (partsError) throw partsError;
      }

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  },

  deleteTemplate: async (id) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);
      if (error) throw error;

      await get().fetchAll();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  },

  toggleLanguage: () => {
    const newLang = get().language === 'en' ? 'he' : 'en';
    localStorage.setItem('woodworking-lang', newLang);
    set({ language: newLang });
  },

  initialize: async () => {
    if (get().initialized) return;

    await get().fetchAll();
    set({ initialized: true });
  },
}));
