import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/stores/useStore';
import { useTranslation } from '@/i18n/useTranslation';
import { Icon } from '@/components/Icon';
import type { Category } from '@/types';

interface CategoryFormState {
  name: string;
  description: string;
  color: string;
}

const EMPTY_FORM: CategoryFormState = {
  name: '',
  description: '',
  color: '#8B5E3C',
};

function CategoryModal({
  isOpen,
  initialCategory,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  initialCategory: Category | null;
  onClose: () => void;
  onSave: (category: Category) => void;
}) {
  const { t } = useTranslation();

  const [form, setForm] = useState<CategoryFormState>(() => {
    if (initialCategory) {
      return {
        name: initialCategory.name,
        description: initialCategory.description ?? '',
        color: initialCategory.color,
      };
    }
    return { ...EMPTY_FORM };
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!form.name.trim()) return;

    const category: Category = {
      id: initialCategory?.id ?? uuidv4(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      color: form.color,
    };

    onSave(category);
    onClose();
  };

  const inputClass =
    'w-full bg-surface-container-highest border-b-2 border-outline focus:border-primary focus:ring-0 px-4 py-3 outline-none transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md m-4">
        <div className="p-6 border-b border-outline-variant">
          <h2 className="font-headline text-xl font-bold">
            {initialCategory ? 'Edit Category' : 'New Category'}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-secondary block mb-2">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className={inputClass}
              placeholder="e.g. Hardwood"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-secondary block mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-secondary block mb-2">
              Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.color}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, color: e.target.value }))
                }
                className="w-12 h-12 rounded-lg border border-outline-variant cursor-pointer"
              />
              <span className="font-mono text-sm text-secondary">
                {form.color}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-outline-variant flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  materialCount,
  onEdit,
  onDelete,
}: {
  category: Category;
  materialCount: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-surface-container-low p-6 rounded-xl flex items-start gap-4 border border-outline-variant/30 hover:border-outline-variant transition-colors">
      <div
        className="w-10 h-10 rounded-full flex-shrink-0"
        style={{ backgroundColor: category.color }}
      />

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-on-surface">{category.name}</h3>
        {category.description && (
          <p className="text-secondary text-sm mt-1">{category.description}</p>
        )}
        <p className="text-xs text-secondary mt-2 font-mono">
          {materialCount} material{materialCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-colors"
          title={t('common.edit')}
        >
          <Icon name="edit" className="text-lg" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
          title={t('common.delete')}
        >
          <Icon name="delete" className="text-lg" />
        </button>
      </div>
    </div>
  );
}

export function Categories() {
  const { t } = useTranslation();
  const categories = useStore((state) => state.categories);
  const materials = useStore((state) => state.materials);
  const addCategory = useStore((state) => state.addCategory);
  const updateCategory = useStore((state) => state.updateCategory);
  const deleteCategory = useStore((state) => state.deleteCategory);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const materialCountByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const mat of materials) {
      counts.set(mat.categoryId, (counts.get(mat.categoryId) ?? 0) + 1);
    }
    return counts;
  }, [materials]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSave = (category: Category) => {
    if (editingCategory) {
      updateCategory(category);
    } else {
      addCategory(category);
    }
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold text-on-surface">
          Material Categories
        </h1>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Icon name="add" className="text-base" />
          New Category
        </button>
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            materialCount={materialCountByCategory.get(category.id) ?? 0}
            onEdit={() => handleOpenEdit(category)}
            onDelete={() => handleDelete(category.id)}
          />
        ))}
        {categories.length === 0 && (
          <div className="p-12 bg-surface-container rounded-xl text-center text-secondary">
            <Icon name="category" className="text-4xl mb-3" />
            <p>No categories yet. Create your first category.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CategoryModal
          isOpen={isModalOpen}
          initialCategory={editingCategory}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
