import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/stores/useStore';
import { useTranslation } from '@/i18n/useTranslation';
import { Icon } from '@/components/Icon';
import {
  calculateMaterialsCost,
  calculateLaborCost,
  calculateFinalPrice,
  formatCurrency,
} from '@/utils/cost-calculator';
import type { Template } from '@/types';

function TemplateCard({
  template,
  estimatedCost,
  onUse,
  onEdit,
  onDelete,
}: {
  template: Template;
  estimatedCost: number;
  onUse: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const materialCount = template.materials.length;
  const laborHours = template.laborHours;

  return (
    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 hover:border-outline-variant transition-colors flex flex-col">
      <div className="flex-1">
        <h3 className="font-headline font-bold text-lg text-on-surface">
          {template.templateName}
        </h3>
        {template.templateDescription && (
          <p className="text-secondary text-sm mt-2">
            {template.templateDescription}
          </p>
        )}

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Materials
            </p>
            <p className="font-mono font-bold mt-1">{materialCount}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Labor
            </p>
            <p className="font-mono font-bold mt-1">{laborHours}h</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Est. Cost
            </p>
            <p className="font-mono font-bold mt-1 text-primary">
              {formatCurrency(estimatedCost)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button
          onClick={onUse}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Icon name="content_copy" className="text-base" />
          Use Template
        </button>
        <button
          onClick={onEdit}
          className="p-2.5 border border-outline-variant rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-colors"
          title={t('common.edit')}
        >
          <Icon name="edit" className="text-lg" />
        </button>
        <button
          onClick={onDelete}
          className="p-2.5 border border-outline-variant rounded-lg text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
          title={t('common.delete')}
        >
          <Icon name="delete" className="text-lg" />
        </button>
      </div>
    </div>
  );
}

export function Templates() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const templates = useStore((state) => state.templates);
  const materials = useStore((state) => state.materials);
  const deleteTemplate = useStore((state) => state.deleteTemplate);

  const templateCosts = useMemo(() => {
    const costs = new Map<string, number>();
    for (const tmpl of templates) {
      const materialsCost = calculateMaterialsCost(tmpl.materials, materials);
      const laborCost = calculateLaborCost(tmpl.laborHours, tmpl.hourlyRate);
      const breakdown = calculateFinalPrice({
        materialsCost,
        laborCost,
        markupFactor: tmpl.markupFactor,
        markupAppliedTo: tmpl.markupAppliedTo,
        discountPercent: tmpl.discountPercent,
      });
      costs.set(tmpl.id, breakdown.finalPrice);
    }
    return costs;
  }, [templates, materials]);

  const handleUseTemplate = (templateId: string) => {
    navigate(`/calculator?template=${templateId}`);
  };

  const handleEditTemplate = (templateId: string) => {
    navigate(`/calculator/${templateId}?mode=template`);
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
  };

  const handleNewTemplate = () => {
    navigate('/calculator?mode=template');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold text-on-surface">
          Templates Library
        </h1>
        <button
          onClick={handleNewTemplate}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Icon name="add" className="text-base" />
          New Template
        </button>
      </div>

      {templates.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              estimatedCost={templateCosts.get(template.id) ?? 0}
              onUse={() => handleUseTemplate(template.id)}
              onEdit={() => handleEditTemplate(template.id)}
              onDelete={() => handleDeleteTemplate(template.id)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 bg-surface-container rounded-xl text-center text-secondary">
          <Icon name="description" className="text-4xl mb-3" />
          <p>No templates yet. Create your first template.</p>
        </div>
      )}
    </div>
  );
}
