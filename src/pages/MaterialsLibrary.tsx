import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/stores/useStore';
import { useTranslation } from '@/i18n/useTranslation';
import { Icon } from '@/components/Icon';
import { formatCurrency } from '@/utils/cost-calculator';
import type { Material, MaterialVariant, Unit } from '@/types';

const UNIT_OPTIONS: Unit[] = [
  'meter',
  'sheet',
  'liter',
  'piece',
  'kg',
  'm2',
  'm3',
];

interface MaterialFormState {
  name: string;
  categoryId: string;
  unit: Unit;
  basePrice: string;
  basePriceLabel: string;
  description: string;
  variants: Array<{ id: string; label: string; price: string }>;
  photoUrl: string;
}

const EMPTY_FORM: MaterialFormState = {
  name: '',
  categoryId: '',
  unit: 'meter',
  basePrice: '',
  basePriceLabel: '',
  description: '',
  variants: [],
  photoUrl: '',
};

function CategoryTabs({
  activeCategoryId,
  onSelect,
}: {
  activeCategoryId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const { t } = useTranslation();
  const categories = useStore((state) => state.categories);

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-outline-variant">
      <button
        onClick={() => onSelect(null)}
        className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
          activeCategoryId === null
            ? 'border-b-2 border-primary text-primary'
            : 'text-secondary hover:text-on-surface'
        }`}
      >
        {t('materials.allMaterials')}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
            activeCategoryId === cat.id
              ? 'border-b-2 border-primary text-primary'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

function MaterialThumbnail({ material }: { material: Material }) {
  if (material.photoUrl) {
    return (
      <img
        src={material.photoUrl}
        alt={material.name}
        className="w-10 h-10 rounded-lg object-cover"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
      <Icon name="category" className="text-secondary text-lg" />
    </div>
  );
}

function CategoryBadge({ categoryId }: { categoryId: string }) {
  const categories = useStore((state) => state.categories);
  const category = categories.find((c) => c.id === categoryId);

  if (!category) return <span className="text-secondary text-sm">--</span>;

  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${category.color}20`,
        color: category.color,
      }}
    >
      {category.name}
    </span>
  );
}

function MaterialTable({
  materials,
  selectedId,
  onSelect,
}: {
  materials: Material[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-outline-variant/30">
            <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary px-6 py-4">
              {t('materials.materialName')}
            </th>
            <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
              {t('materials.category')}
            </th>
            <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
              {t('materials.unit')}
            </th>
            <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
              {t('materials.basePrice')}
            </th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => (
            <tr
              key={material.id}
              onClick={() => onSelect(material.id)}
              className={`border-b border-outline-variant/20 cursor-pointer transition-colors ${
                selectedId === material.id
                  ? 'bg-primary/5'
                  : 'hover:bg-surface-container'
              }`}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <MaterialThumbnail material={material} />
                  <div>
                    <p className="font-medium text-on-surface">
                      {material.name}
                    </p>
                    {material.description && (
                      <p className="text-xs text-secondary mt-0.5">
                        {material.description}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <CategoryBadge categoryId={material.categoryId} />
              </td>
              <td className="px-4 py-4 text-sm text-secondary">
                {t(`units.${material.unit}`)}
              </td>
              <td className="px-4 py-4 font-mono font-bold">
                {formatCurrency(material.basePrice)}
              </td>
              <td className="px-2 py-4">
                <Icon name="more_vert" className="text-secondary" />
              </td>
            </tr>
          ))}
          {materials.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-12 text-center text-secondary"
              >
                {t('materials.noMaterialsFound')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function DetailPanel({
  material,
  onEdit,
  onDelete,
}: {
  material: Material;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const categories = useStore((state) => state.categories);
  const category = categories.find((c) => c.id === material.categoryId);

  return (
    <div className="glass-panel rounded-xl p-6 space-y-6">
      {material.photoUrl && (
        <img
          src={material.photoUrl}
          alt={material.name}
          className="w-full h-48 object-cover rounded-lg"
        />
      )}

      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">
          {material.name}
        </h2>
        {category && <p className="text-primary mt-1">{category.name}</p>}
        {material.description && (
          <p className="text-secondary text-sm mt-2">{material.description}</p>
        )}
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">
          {t('materials.basePrice')}
          {material.basePriceLabel && ` — ${material.basePriceLabel}`}
        </p>
        <p className="font-mono text-2xl font-bold">
          {formatCurrency(material.basePrice)}
        </p>
        <p className="text-xs text-secondary">
          {t('materials.perUnit')}{' '}
          {t(`units.${material.unit}`).toLowerCase()}
        </p>
      </div>

      {material.variants && material.variants.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-3">
            {t('materials.variants')}
          </p>
          <div className="space-y-2">
            {material.variants.map((variant) => (
              <div
                key={variant.id}
                className="flex items-center justify-between bg-surface-container-high p-3 rounded-lg"
              >
                <span className="text-sm font-medium">{variant.label}</span>
                <span className="font-mono font-bold text-sm">
                  {formatCurrency(variant.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
        >
          <Icon name="edit" className="text-base" />
          {t('common.edit')}
        </button>
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <Icon name="delete" className="text-base" />
          {t('common.delete')}
        </button>
      </div>

      <button className="w-full bg-on-surface text-surface py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
        {t('materials.addToProject')}
      </button>
    </div>
  );
}

function MaterialModal({
  isOpen,
  initialMaterial,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  initialMaterial: Material | null;
  onClose: () => void;
  onSave: (material: Material) => void;
}) {
  const { t } = useTranslation();
  const categories = useStore((state) => state.categories);

  const [form, setForm] = useState<MaterialFormState>(() => {
    if (initialMaterial) {
      return {
        name: initialMaterial.name,
        categoryId: initialMaterial.categoryId,
        unit: initialMaterial.unit,
        basePrice: String(initialMaterial.basePrice),
        basePriceLabel: initialMaterial.basePriceLabel ?? '',
        description: initialMaterial.description ?? '',
        variants: (initialMaterial.variants ?? []).map((v) => ({
          id: v.id,
          label: v.label,
          price: String(v.price),
        })),
        photoUrl: initialMaterial.photoUrl ?? '',
      };
    }
    return { ...EMPTY_FORM, categoryId: categories[0]?.id ?? '' };
  });

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setForm((prev) => ({ ...prev, photoUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { id: uuidv4(), label: '', price: '' }],
    }));
  };

  const handleRemoveVariant = (index: number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleVariantChange = (
    index: number,
    field: 'label' | 'price',
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v,
      ),
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.categoryId) return;

    const variants: MaterialVariant[] = form.variants
      .filter((v) => v.label.trim())
      .map((v) => ({
        id: v.id,
        label: v.label.trim(),
        price: parseFloat(v.price) || 0,
      }));

    const material: Material = {
      id: initialMaterial?.id ?? uuidv4(),
      name: form.name.trim(),
      categoryId: form.categoryId,
      unit: form.unit,
      basePrice: parseFloat(form.basePrice) || 0,
      basePriceLabel: form.basePriceLabel.trim() || undefined,
      description: form.description.trim() || undefined,
      variants: variants.length > 0 ? variants : undefined,
      photoUrl: form.photoUrl || undefined,
    };

    onSave(material);
    onClose();
  };

  // Kept separate from the width so fixed-width fields (e.g. variant price)
  // don't get overridden by a conflicting w-full.
  const inputBase =
    'bg-surface-container-highest border-b-2 border-outline focus:border-primary focus:ring-0 px-4 py-3 outline-none transition-colors text-on-surface';
  const inputClass = `w-full ${inputBase}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-outline-variant">
          <h2 className="font-headline text-xl font-bold">
            {initialMaterial
              ? t('materials.editMaterial')
              : t('materials.newMaterial')}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-secondary block mb-2">
              {t('materials.materialName')}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className={inputClass}
              placeholder={t('materials.namePlaceholder')}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-secondary block mb-2">
              {t('materials.description')}
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className={inputClass}
              placeholder={t('materials.optionalDescription')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-secondary block mb-2">
                {t('materials.category')}
              </label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    categoryId: e.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">{t('materials.selectCategory')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-secondary block mb-2">
                {t('materials.unit')}
              </label>
              <select
                value={form.unit}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    unit: e.target.value as Unit,
                  }))
                }
                className={inputClass}
              >
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit} value={unit}>
                    {t(`units.${unit}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-widest text-secondary">
                {t('materials.variants')}
              </label>
              <button
                onClick={handleAddVariant}
                className="text-primary text-sm font-medium flex items-center gap-1"
              >
                <Icon name="add" className="text-base" />
                {t('materials.addVariant')}
              </button>
            </div>
            <div className="flex gap-2 mb-1 px-1">
              <span className="min-w-0 flex-1 text-[10px] font-bold uppercase tracking-widest text-secondary">
                {t('materials.variantLabel')}
              </span>
              <span className="w-28 shrink-0 text-[10px] font-bold uppercase tracking-widest text-secondary">
                {t('materials.price')}
              </span>
              <span className="w-8 shrink-0" />
            </div>
            {/* The base price is the first, non-removable row — same shape as
                the variant rows below it. */}
            <div className="flex gap-2 mb-2 items-center">
              <input
                type="text"
                value={form.basePriceLabel}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    basePriceLabel: e.target.value,
                  }))
                }
                className={`min-w-0 flex-1 ${inputBase}`}
                placeholder={t('materials.basePriceLabelPlaceholder')}
              />
              <input
                type="number"
                value={form.basePrice}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, basePrice: e.target.value }))
                }
                className={`w-28 shrink-0 ${inputBase}`}
                placeholder="0.00"
                min={0}
                step="0.01"
              />
              <span
                className="text-secondary w-8 flex justify-center"
                title={t('materials.baseOption')}
              >
                <Icon name="push_pin" className="text-base" />
              </span>
            </div>
            {form.variants.map((variant, index) => (
              <div key={variant.id} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={variant.label}
                  onChange={(e) =>
                    handleVariantChange(index, 'label', e.target.value)
                  }
                  className={`min-w-0 flex-1 ${inputBase}`}
                  placeholder={t('materials.variantPlaceholder')}
                />
                <input
                  type="number"
                  value={variant.price}
                  onChange={(e) =>
                    handleVariantChange(index, 'price', e.target.value)
                  }
                  className={`w-28 shrink-0 ${inputBase}`}
                  placeholder="0.00"
                  min={0}
                  step="0.01"
                />
                <button
                  onClick={() => handleRemoveVariant(index)}
                  className="text-secondary hover:text-red-600 transition-colors w-8 flex justify-center"
                >
                  <Icon name="close" className="text-base" />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-secondary block mb-2">
              {t('materials.photo')}
            </label>
            {form.photoUrl && (
              <img
                src={form.photoUrl}
                alt={form.name}
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
            )}
            {/* The native file input renders browser-locale text ("Choose
                File"), so it's hidden behind a translated button. */}
            <label className="inline-flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium bg-surface-container-high text-on-surface hover:bg-surface-container cursor-pointer transition-colors">
              <Icon name="upload" className="text-base" />
              {t('materials.choosePhoto')}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
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

export function MaterialsLibrary() {
  const { t } = useTranslation();
  const materials = useStore((state) => state.materials);
  const addMaterial = useStore((state) => state.addMaterial);
  const updateMaterial = useStore((state) => state.updateMaterial);
  const deleteMaterial = useStore((state) => state.deleteMaterial);

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const filteredMaterials = useMemo(
    () =>
      activeCategoryId
        ? materials.filter((m) => m.categoryId === activeCategoryId)
        : materials,
    [materials, activeCategoryId],
  );

  const selectedMaterial = useMemo(
    () => materials.find((m) => m.id === selectedMaterialId) ?? null,
    [materials, selectedMaterialId],
  );

  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (selectedMaterial) {
      setEditingMaterial(selectedMaterial);
      setIsModalOpen(true);
    }
  };

  const handleSave = (material: Material) => {
    if (editingMaterial) {
      updateMaterial(material);
    } else {
      addMaterial(material);
    }
  };

  const handleDelete = () => {
    if (selectedMaterial) {
      deleteMaterial(selectedMaterial.id);
      setSelectedMaterialId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold text-on-surface">
          {t('nav.materialsLibrary')}
        </h1>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Icon name="add" className="text-base" />
          {t('materials.newMaterial')}
        </button>
      </div>

      <CategoryTabs
        activeCategoryId={activeCategoryId}
        onSelect={setActiveCategoryId}
      />

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <MaterialTable
            materials={filteredMaterials}
            selectedId={selectedMaterialId}
            onSelect={setSelectedMaterialId}
          />
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            {selectedMaterial ? (
              <DetailPanel
                material={selectedMaterial}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            ) : (
              <div className="glass-panel rounded-xl p-8 text-center">
                <Icon
                  name="inventory_2"
                  className="text-4xl text-secondary mb-3"
                />
                <p className="text-secondary text-sm">
                  {t('materials.selectMaterialPrompt')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <MaterialModal
          isOpen={isModalOpen}
          initialMaterial={editingMaterial}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
