import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/stores/useStore';
import { useBusinessStore } from '@/stores/useBusinessStore';
import { useTranslation } from '@/i18n/useTranslation';
import { Icon } from '@/components/Icon';
import {
  calculateMaterialsCost,
  calculateLaborCost,
  calculateFinalPrice,
  formatCurrency,
  summarizeMaterialUsage,
  UNIT_ABBR,
} from '@/utils/cost-calculator';
import {
  calculateEffectiveHourlyRate,
  effectiveHoursForProject,
  sumTimeLogHours,
} from '@/utils/business-metrics';
import { packSheets } from '@/utils/bin-packing';
import { SheetVisualization } from '@/components/SheetVisualization';
import { STATUS_BADGE_CLASSES, STATUS_TKEY } from '@/utils/pipeline';

function InfoCell({ label, value }: { label: string; value: string | null }) {
  const { t } = useTranslation();
  return (
    <div className="bg-surface-container-low p-4 rounded-xl border-b-2 border-outline-variant">
      <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
        {label}
      </p>
      <p className={`font-mono text-lg font-bold mt-1 ${value ? '' : 'text-secondary'}`}>
        {value ?? t('income.notSet')}
      </p>
    </div>
  );
}

function TimeLogSection({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const timeLogs = useStore((s) => s.timeLogs);
  const addTimeLog = useStore((s) => s.addTimeLog);
  const deleteTimeLog = useStore((s) => s.deleteTimeLog);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState('');
  const [note, setNote] = useState('');

  const logs = useMemo(
    () =>
      timeLogs
        .filter((l) => l.projectId === projectId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [timeLogs, projectId],
  );
  const total = sumTimeLogHours(timeLogs, projectId);

  const inputClass =
    'bg-surface-container-highest border-b-2 border-outline focus:border-primary outline-none px-3 py-2 rounded-t text-sm';

  const handleAdd = () => {
    const parsed = parseFloat(hours);
    if (!parsed || parsed <= 0) return;
    addTimeLog({
      id: uuidv4(),
      projectId,
      date,
      hours: parsed,
      note: note || undefined,
      createdAt: new Date().toISOString(),
    });
    setHours('');
    setNote('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-headline text-lg font-bold uppercase tracking-wide">
          {t('timeLog.title')}
        </h2>
        <span className="text-sm text-secondary">
          {t('timeLog.totalLogged')}:{' '}
          <span className="font-mono font-bold text-on-surface">{total} {t('common.hrs')}</span>
        </span>
      </div>

      <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-end gap-3 no-print">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder={t('timeLog.hours')}
            min={0}
            step="0.5"
            className={`${inputClass} w-24 font-mono`}
          />
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('timeLog.note')}
            className={`${inputClass} flex-1 min-w-[140px]`}
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Icon name="add" className="text-lg" />
            {t('timeLog.addEntry')}
          </button>
        </div>

        {logs.length === 0 ? (
          <p className="text-secondary text-sm py-2">{t('timeLog.empty')}</p>
        ) : (
          <div className="divide-y divide-outline-variant/20">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 py-2 text-sm">
                <span className="font-mono text-secondary w-28">{log.date}</span>
                <span className="font-mono font-bold w-16">{log.hours}h</span>
                <span className="flex-1 text-secondary">{log.note ?? ''}</span>
                <button
                  onClick={() => deleteTimeLog(log.id)}
                  className="text-secondary hover:text-error transition-colors no-print"
                >
                  <Icon name="delete" className="text-base" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
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
            <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary px-6 py-4">
              {t('projectDetails.material')}
            </th>
            <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
              {t('projectDetails.variant')}
            </th>
            <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
              {t('common.qty')}
            </th>
            <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
              {t('projectDetails.unitPrice')}
            </th>
            <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary px-6 py-4">
              {t('common.total')}
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
              <td className="px-4 py-3 text-end font-mono">
                {pm.quantity}
              </td>
              <td className="px-4 py-3 text-end font-mono">
                {formatCurrency(pm.unitPrice)}
              </td>
              <td className="px-6 py-3 text-end font-mono font-bold">
                {formatCurrency(pm.total)}
              </td>
            </tr>
          ))}
          {projectMaterials.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-secondary">
                {t('projectDetails.noMaterials')}
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
  const { t } = useTranslation();

  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-outline-variant/30">
            <th className="text-start text-[10px] font-bold uppercase tracking-widest text-secondary px-6 py-4">
              {t('projectDetails.partName')}
            </th>
            <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
              {t('projectDetails.lengthMm')}
            </th>
            <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
              {t('projectDetails.widthMm')}
            </th>
            <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary px-4 py-4">
              {t('common.qty')}
            </th>
            <th className="text-end text-[10px] font-bold uppercase tracking-widest text-secondary px-6 py-4">
              {t('projectDetails.areaMm2')}
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
              <td className="px-4 py-3 text-end font-mono">
                {part.lengthMm.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-end font-mono">
                {part.widthMm.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-end font-mono">
                {part.quantity}
              </td>
              <td className="px-6 py-3 text-end font-mono font-bold">
                {part.area.toLocaleString()}
              </td>
            </tr>
          ))}
          {woodParts.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-secondary">
                {t('projectDetails.noWoodParts')}
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
  const timeLogs = useStore((state) => state.timeLogs);
  const expenses = useBusinessStore((state) => state.expenses);

  const project = useMemo(
    () => projects.find((p) => p.id === id) ?? null,
    [projects, id],
  );

  const linkedExpensesTotal = useMemo(
    () =>
      project
        ? expenses
            .filter((e) => e.projectId === project.id)
            .reduce((sum, e) => sum + e.amount, 0)
        : 0,
    [project, expenses],
  );

  const effectiveRate = useMemo(() => {
    if (!project) return null;
    const materialsCost = calculateMaterialsCost(project.materials, allMaterials);
    return calculateEffectiveHourlyRate({
      agreedPrice: project.agreedPrice ?? 0,
      materialsCost,
      linkedExpenses: linkedExpensesTotal,
      actualHours: effectiveHoursForProject(project, timeLogs),
    });
  }, [project, allMaterials, linkedExpensesTotal, timeLogs]);

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
        name: material?.name ?? t('projectDetails.unknownMaterial'),
        variantLabel: variant?.label ?? material?.basePriceLabel ?? null,
        quantity: pm.quantity,
        unitPrice,
        total: unitPrice * pm.quantity,
      };
    });
  }, [project, allMaterials, t]);

  const materialSummary = useMemo(
    () => (project ? summarizeMaterialUsage(project.materials, allMaterials) : []),
    [project, allMaterials],
  );
  const hasDuplicateMaterials = project
    ? materialSummary.length < project.materials.length
    : false;

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
        <p className="text-secondary text-lg">{t('common.projectNotFound')}</p>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 text-primary font-medium hover:underline"
        >
          {t('common.backToProjects')}
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const typeLabel = (type: string) => {
    const v = t(`projectTypes.${type}`);
    return v === `projectTypes.${type}` ? type : v;
  };

  const paymentCells = [
    project.quotedPrice && {
      label: t('income.quotedPrice'),
      value: formatCurrency(project.quotedPrice),
    },
    project.agreedPrice && {
      label: t('income.agreedPrice'),
      value: formatCurrency(project.agreedPrice),
    },
    project.depositAmount && {
      label: t('income.depositAmount'),
      value: formatCurrency(project.depositAmount),
    },
    project.leadSource && {
      label: t('income.leadSource'),
      value: t(`leadSource.${project.leadSource}`),
    },
    project.depositPaidAt && {
      label: t('income.depositPaid'),
      value: project.depositPaidAt,
    },
    project.balancePaidAt && {
      label: t('income.balancePaid'),
      value: project.balancePaidAt,
    },
    project.deliveredAt && {
      label: t('income.delivered'),
      value: project.deliveredAt,
    },
    project.actualHours && {
      label: t('income.actualHours'),
      value: `${project.actualHours} ${t('common.hrs')}`,
    },
  ].filter(Boolean) as { label: string; value: string }[];

  // Effective rate is only meaningful once an agreed price exists.
  const showEffectiveRate = Boolean(project.agreedPrice) && effectiveRate !== null;
  const showPaymentsSection = paymentCells.length > 0 || showEffectiveRate;

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
                {typeLabel(project.type)}
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
                {t(STATUS_TKEY[project.status])}
              </span>
              {project.onHold && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-error/10 text-error">
                  {t('pipeline.onHold')}
                </span>
              )}
              <span className="text-secondary text-sm font-mono">
                {project.date}
              </span>
              {project.buyerName && (
                <span className="text-secondary text-sm">
                  {t('projectDetails.buyer')} {project.buyerName}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 no-print">
            <button
              onClick={() => navigate(`/projects/${project.id}/quote`)}
              className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
            >
              <Icon name="request_quote" className="text-base" />
              {t('pipeline.quote')}
            </button>
            <button
              onClick={() => navigate(`/calculator/${project.id}`)}
              className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
            >
              <Icon name="edit" className="text-base" />
              {t('common.edit')}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
            >
              <Icon name="print" className="text-base" />
              {t('projectDetails.print')}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
            >
              <Icon name="picture_as_pdf" className="text-base" />
              {t('projectDetails.exportPdf')}
            </button>
          </div>
        </div>
      </div>

      {costBreakdown && (
        <div>
          <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-4">
            {t('projectDetails.costBreakdown')}
          </h2>
          <div className="bg-surface-container-low rounded-xl overflow-hidden">
            <table className="w-full">
              <tbody>
                <tr className="border-b border-outline-variant/30">
                  <td className="px-6 py-4 text-secondary text-sm">
                    {t('calculator.materials')}
                  </td>
                  <td className="px-6 py-4 text-end font-mono">
                    {formatCurrency(costBreakdown.materialsCost)}
                  </td>
                </tr>
                <tr className="border-b border-outline-variant/30">
                  <td className="px-6 py-4 text-secondary text-sm">
                    {t('calculator.laborCost')}
                  </td>
                  <td className="px-6 py-4 text-end font-mono">
                    {formatCurrency(costBreakdown.laborCost)}
                  </td>
                </tr>
                {costBreakdown.markupAmount > 0 && (
                  <tr className="border-b border-outline-variant/30">
                    <td className="px-6 py-4 text-secondary text-sm">
                      {t('calculator.markup')}
                    </td>
                    <td className="px-6 py-4 text-end font-mono text-tertiary">
                      +{formatCurrency(costBreakdown.markupAmount)}
                    </td>
                  </tr>
                )}
                {costBreakdown.discountAmount > 0 && (
                  <tr className="border-b border-outline-variant/30">
                    <td className="px-6 py-4 text-secondary text-sm">
                      {t('calculator.discount')}
                    </td>
                    <td className="px-6 py-4 text-end font-mono text-error">
                      −{formatCurrency(costBreakdown.discountAmount)}
                    </td>
                  </tr>
                )}
                <tr className="bg-surface-container">
                  <td className="px-6 py-4 font-bold">
                    {t('calculator.finalPrice')}
                  </td>
                  <td className="px-6 py-4 text-end font-mono font-bold text-lg text-primary">
                    {formatCurrency(costBreakdown.finalPrice)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPaymentsSection && (
        <div>
          <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-4">
            {t('income.payments')}
          </h2>
          {paymentCells.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {paymentCells.map((cell) => (
                <InfoCell key={cell.label} label={cell.label} value={cell.value} />
              ))}
            </div>
          )}
          {showEffectiveRate && effectiveRate !== null && (
            <div
              className={`bg-primary text-white p-6 rounded-xl inline-flex items-center gap-4 ${
                paymentCells.length > 0 ? 'mt-4' : ''
              }`}
            >
              <Icon name="trending_up" className="text-3xl" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                  {t('pnl.effectiveRate')}
                </p>
                <p className="font-mono text-3xl font-bold">
                  {formatCurrency(effectiveRate)}/hr
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <TimeLogSection projectId={project.id} />

      <div>
        <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-4">
          {t('calculator.materialsList')}
        </h2>
        <MaterialsTable projectMaterials={resolvedMaterials} />
        {hasDuplicateMaterials && (
          <div className="mt-4 bg-surface-container-low rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-2">
              {t('calculator.materialTotals')}
            </p>
            <div className="space-y-1">
              {materialSummary.map((row) => (
                <div
                  key={row.materialId}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{row.name}</span>
                  <span className="font-mono text-secondary">
                    {row.totalQuantity} {UNIT_ABBR[row.unit]} ·{' '}
                    {formatCurrency(row.totalCost)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-headline text-lg font-bold uppercase tracking-wide mb-4">
          {t('projectDetails.woodParts')}
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
                {t('projectDetails.totalPieces')}
              </p>
              <p className="font-mono text-xl font-bold mt-1">
                {totalPieces}
              </p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                {t('projectDetails.sheetsRequired')}
              </p>
              <p className="font-mono text-xl font-bold mt-1">
                {sheetPackingResult.totalSheets}
              </p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                {t('projectDetails.waste')}
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
