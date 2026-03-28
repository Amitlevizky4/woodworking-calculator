import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/stores/useStore';
import { useTranslation } from '@/i18n/useTranslation';
import { Icon } from '@/components/Icon';
import {
  calculateMaterialsCost,
  calculateLaborCost,
  calculateFinalPrice,
  formatCurrency,
} from '@/utils/cost-calculator';
import { packSheets } from '@/utils/bin-packing';
import { SheetVisualization } from '@/components/SheetVisualization';
import type { Status } from '@/types';

const STATUS_BADGE_CLASSES: Record<Status, string> = {
  planning: 'bg-surface-variant text-secondary',
  'in-progress': 'bg-primary/10 text-primary',
  completed: 'bg-tertiary/10 text-tertiary',
  'on-hold': 'bg-secondary-container text-on-secondary-container',
};

const STATUS_LABELS: Record<Status, string> = {
  planning: 'Planning',
  'in-progress': 'In Progress',
  completed: 'Completed',
  'on-hold': 'On Hold',
};

function CostCard({
  label,
  value,
  isHighlighted,
}: {
  label: string;
  value: string;
  isHighlighted?: boolean;
}) {
  if (isHighlighted) {
    return (
      <div className="bg-primary text-white p-6 rounded-xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
          {label}
        </p>
        <p className="font-mono text-3xl font-bold mt-2">{value}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low p-6 rounded-xl border-b-2 border-outline-variant">
      <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
        {label}
      </p>
      <p className="font-mono text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function MaterialsTable({
  projectMaterials,
}: {
  projectMaterials: Array<{
    name: string;
    variantLabel: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-outline-variant/30">
            <th className="text-left text-[10px] font-bold uppercase tracking-widest text-secondary px-6 py-4">
              Material
            </th>
            <th className="text-left text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
              Variant
            </th>
            <th className="text-right text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
              Qty
            </th>
            <th className="text-right text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
              Unit Price
            </th>
            <th className="text-right text-[10px] font-bold uppercase tracking-widest text-secondary px-6 py-4">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {projectMaterials.map((pm, index) => (
            <tr
              key={index}
              className="border-b border-outline-variant/20"
            >
              <td className="px-6 py-3 font-medium">{pm.name}</td>
              <td className="px-4 py-3 text-secondary text-sm">
                {pm.variantLabel ?? '--'}
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {pm.quantity}
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {formatCurrency(pm.unitPrice)}
              </td>
              <td className="px-6 py-3 text-right font-mono font-bold">
                {formatCurrency(pm.total)}
              </td>
            </tr>
          ))}
          {projectMaterials.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-secondary">
                No materials added
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function WoodPartsTable({
  woodParts,
}: {
  woodParts: Array<{
    name: string;
    lengthMm: number;
    widthMm: number;
    quantity: number;
    area: number;
  }>;
}) {
  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-outline-variant/30">
            <th className="text-left text-[10px] font-bold uppercase tracking-widest text-secondary px-6 py-4">
              Part Name
            </th>
            <th className="text-right text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
              Length (mm)
            </th>
            <th className="text-right text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
              Width (mm)
            </th>
            <th className="text-right text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
              Qty
            </th>
            <th className="text-right text-[10px] font-bold uppercase tracking-widest text-secondary px-6 py-4">
              Area (mm\u00B2)
            </th>
          </tr>
        </thead>
        <tbody>
          {woodParts.map((part, index) => (
            <tr
              key={index}
              className="border-b border-outline-variant/20"
            >
              <td className="px-6 py-3 font-medium">{part.name}</td>
              <td className="px-4 py-3 text-right font-mono">
                {part.lengthMm.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {part.widthMm.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {part.quantity}
              </td>
              <td className="px-6 py-3 text-right font-mono font-bold">
                {part.area.toLocaleString()}
              </td>
            </tr>
          ))}
          {woodParts.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-secondary">
                No wood parts defined
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function ProjectDetails() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projects = useStore((state) => state.projects);
  const allMaterials = useStore((state) => state.materials);

  const project = useMemo(
    () => projects.find((p) => p.id === id) ?? null,
    [projects, id],
  );

  const costBreakdown = useMemo(() => {
    if (!project) return null;
    const materialsCost = calculateMaterialsCost(
      project.materials,
      allMaterials,
    );
    const laborCost = calculateLaborCost(
      project.laborHours,
      project.hourlyRate,
    );
    return calculateFinalPrice({
      materialsCost,
      laborCost,
      markupFactor: project.markupFactor,
      markupAppliedTo: project.markupAppliedTo,
      discountPercent: project.discountPercent,
    });
  }, [project, allMaterials]);

  const resolvedMaterials = useMemo(() => {
    if (!project) return [];
    return project.materials.map((pm) => {
      const material = allMaterials.find((m) => m.id === pm.materialId);
      const variant =
        pm.variantId && material?.variants
          ? material.variants.find((v) => v.id === pm.variantId)
          : null;
      const unitPrice = variant ? variant.price : (material?.basePrice ?? 0);
      return {
        name: material?.name ?? 'Unknown Material',
        variantLabel: variant?.label ?? null,
        quantity: pm.quantity,
        unitPrice,
        total: unitPrice * pm.quantity,
      };
    });
  }, [project, allMaterials]);

  const woodPartsData = useMemo(() => {
    if (!project) return [];
    return project.woodParts.map((part) => ({
      name: part.name,
      lengthMm: part.lengthMm,
      widthMm: part.widthMm,
      quantity: part.quantity,
      area: part.lengthMm * part.widthMm * part.quantity,
    }));
  }, [project]);

  const sheetPackingResult = useMemo(() => {
    if (!project || project.woodParts.length === 0) return null;
    return packSheets(project.woodParts);
  }, [project]);

  const totalPieces = useMemo(() => {
    if (!project) return 0;
    return project.woodParts.reduce((sum, p) => sum + p.quantity, 0);
  }, [project]);

  if (!project) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <Icon name="error" className="text-5xl text-secondary mb-4" />
        <p className="text-secondary text-lg">Project not found</p>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 text-primary font-medium hover:underline"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-block bg-surface-container-high text-secondary text-xs font-mono px-3 py-1 rounded-full mb-3">
              {project.id.slice(0, 8).toUpperCase()}
            </span>
            <h1 className="font-headline text-3xl font-bold text-on-surface">
              {project.name}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-secondary text-sm capitalize">
                {project.type}
              </span>
              {project.description && (
                <>
                  <span className="text-outline">|</span>
                  <span className="text-secondary text-sm">
                    {project.description}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_CLASSES[project.status]}`}
              >
                {STATUS_LABELS[project.status]}
              </span>
              <span className="text-secondary text-sm font-mono">
                {project.date}
              </span>
              {project.buyerName && (
                <span className="text-secondary text-sm">
                  Buyer: {project.buyerName}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
            >
              <Icon name="print" className="text-base" />
              Print
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
            >
              <Icon name="picture_as_pdf" className="text-base" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {costBreakdown && (
        <div>
          <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-4">
            Cost Breakdown
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <CostCard
              label={t('calculator.materials')}
              value={formatCurrency(costBreakdown.materialsCost)}
            />
            <CostCard
              label={t('calculator.laborCost')}
              value={formatCurrency(costBreakdown.laborCost)}
            />
            <CostCard
              label={t('calculator.markup')}
              value={formatCurrency(costBreakdown.markupAmount)}
            />
            <CostCard
              label={t('calculator.discount')}
              value={formatCurrency(costBreakdown.discountAmount)}
            />
            <CostCard
              label={t('calculator.finalPrice')}
              value={formatCurrency(costBreakdown.finalPrice)}
              isHighlighted
            />
          </div>
        </div>
      )}

      <div>
        <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-4">
          {t('calculator.materialsList')}
        </h2>
        <MaterialsTable projectMaterials={resolvedMaterials} />
      </div>

      <div>
        <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-4">
          Wood Parts
        </h2>
        <WoodPartsTable woodParts={woodPartsData} />
      </div>

      {sheetPackingResult && (
        <div>
          <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-4">
            {t('calculator.sheetOptimization')}
          </h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-surface-container-low p-4 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                Total Pieces
              </p>
              <p className="font-mono text-xl font-bold mt-1">
                {totalPieces}
              </p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                Sheets Required
              </p>
              <p className="font-mono text-xl font-bold mt-1">
                {sheetPackingResult.totalSheets}
              </p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                Waste
              </p>
              <p className="font-mono text-xl font-bold mt-1">
                {sheetPackingResult.wastePercent}%
              </p>
            </div>
          </div>

          <SheetVisualization sheets={sheetPackingResult.sheets} />
        </div>
      )}
    </div>
  );
}
