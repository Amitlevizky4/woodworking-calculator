import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/stores/useStore';
import { useTranslation } from '@/i18n/useTranslation';
import { Icon } from '@/components/Icon';
import type { ProductType } from '@/types';

const COLORS = ['#a43700', '#8f7066', '#4A7C6F', '#6B7C5C', '#8B5E3C', '#5f5e5e'];

const INPUT_CLASS =
  'w-full bg-surface-container-highest border-b-2 border-outline focus:border-primary outline-none px-4 py-3 rounded-t-md text-on-surface';

export function ProductTypes() {
  const { t } = useTranslation();
  const productTypes = useStore((s) => s.productTypes);
  const addProductType = useStore((s) => s.addProductType);
  const updateProductType = useStore((s) => s.updateProductType);
  const deleteProductType = useStore((s) => s.deleteProductType);

  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [editing, setEditing] = useState<ProductType | null>(null);

  const resetForm = () => {
    setName('');
    setColor(COLORS[0]);
    setEditing(null);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editing) {
      updateProductType({ ...editing, name: name.trim(), color });
    } else {
      addProductType({ id: uuidv4(), name: name.trim(), color });
    }
    resetForm();
  };

  const startEdit = (pt: ProductType) => {
    setEditing(pt);
    setName(pt.name);
    setColor(pt.color);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold text-on-surface">
          {t('productTypes2.title')}
        </h1>
        <p className="text-secondary mt-1">{t('productTypes2.assignHint')}</p>
      </div>

      <div className="bg-surface-container rounded-2xl p-6 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
            {t('productTypes2.name')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div className="flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-on-surface' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Icon name={editing ? 'save' : 'add'} className="text-lg" />
          {editing ? t('common.save') : t('productTypes2.newType')}
        </button>
        {editing && (
          <button
            onClick={resetForm}
            className="px-5 py-2.5 rounded-lg font-medium border border-outline-variant hover:bg-surface-container transition-colors"
          >
            {t('common.cancel')}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {productTypes.length === 0 ? (
          <p className="text-secondary text-sm">{t('productTypes2.none')}</p>
        ) : (
          productTypes.map((pt) => (
            <div
              key={pt.id}
              className="flex items-center justify-between gap-4 bg-surface-container-low rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: pt.color }}
                />
                <span className="font-medium">{pt.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(pt)}
                  className="text-secondary hover:text-primary transition-colors"
                >
                  <Icon name="edit" className="text-base" />
                </button>
                <button
                  onClick={() => deleteProductType(pt.id)}
                  className="text-secondary hover:text-error transition-colors"
                >
                  <Icon name="delete" className="text-base" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
