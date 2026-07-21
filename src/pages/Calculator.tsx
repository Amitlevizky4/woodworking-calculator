import { Fragment, useState, useMemo, useCallback } from 'react';
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
import { evaluateTargetHourlyRate } from '@/utils/business-metrics';
import { STATUS_TKEY } from '@/utils/pipeline';
import { packSheets } from '@/utils/bin-packing';
import { PIPELINE_STAGES } from '@/types';
import type {
  ProjectMaterial,
  WoodPart,
  Status,
  MarkupAppliedTo,
  Material,
  LeadSource,
} from '@/types';
import type { SheetLayout } from '@/utils/bin-packing';

const PROJECT_TYPES = ['furniture', 'cabinet', 'shelf', 'table', 'custom'] as const;
const LEAD_SOURCES: LeadSource[] = [
  'instagram',
  'facebook_group',
  'marketplace',
  'word_of_mouth',
  'designer',
  'friends_family',
  'other',
];

const PIECE_COLORS = [
  'var(--color-primary)',
  'var(--color-tertiary)',
  'var(--color-outline)',
  'var(--color-secondary)',
];

const INPUT_CLASS =
  'w-full bg-surface-container-highest border-b-2 border-outline focus:border-primary focus:ring-0 px-4 py-3 outline-none rounded-t-md text-on-surface';

interface PartialSheetPiece {
  id: string;
  length: string;
  width: string;
  count: string;
}

interface PartialSheetState {
  sheetL: string;
  sheetW: string;
  pieces: PartialSheetPiece[];
}

// Fraction of a sheet covered by all fully-entered pieces (length x width x
// count each), rounded to the 2 decimals the DB stores for quantities. Null
// until the sheet dimensions and at least one piece are valid.
function sheetFraction(state: PartialSheetState): number | null {
  const sheetL = parseFloat(state.sheetL);
  const sheetW = parseFloat(state.sheetW);
  if (!sheetL || !sheetW) return null;

  const usedArea = state.pieces.reduce((sum, piece) => {
    const length = parseFloat(piece.length);
    const width = parseFloat(piece.width);
    const count = parseFloat(piece.count);
    if (!length || !width || !count) return sum;
    return sum + length * width * count;
  }, 0);

  if (usedArea <= 0) return null;
  return Math.max(0.01, Math.round((usedArea / (sheetL * sheetW)) * 100) / 100);
}

function emptyPartialSheetPiece(): PartialSheetPiece {
  return { id: uuidv4(), length: '', width: '', count: '1' };
}

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Icon name={icon} className="text-primary text-2xl" />
      <h2 className="font-headline font-bold text-lg uppercase tracking-wide text-on-surface">
        {label}
      </h2>
    </div>
  );
}

function MaterialPicker({
  materials,
  onSelect,
  onClose,
}: {
  materials: Material[];
  onSelect: (material: Material) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const { t } = useTranslation();

  const filtered = materials.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-surface-container-highest border border-outline-variant rounded-lg shadow-xl max-h-64 overflow-auto">
      <div className="sticky top-0 bg-surface-container-highest p-2 border-b border-outline-variant">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.search')}
          className={INPUT_CLASS}
          autoFocus
        />
      </div>
      {filtered.length === 0 ? (
        <div className="p-4 text-center text-secondary text-sm">
          {t('materials.noMaterialsFound')}
        </div>
      ) : (
        filtered.map((material) => (
          <button
            key={material.id}
            type="button"
            onClick={() => {
              onSelect(material);
              onClose();
            }}
            className="w-full text-start px-4 py-3 hover:bg-surface-container transition-colors flex justify-between items-center"
          >
            <span className="text-on-surface">{material.name}</span>
            <span className="font-mono text-sm text-secondary">
              {formatCurrency(material.basePrice)}
            </span>
          </button>
        ))
      )}
    </div>
  );
}

function SheetVisualization({ sheets }: { sheets: SheetLayout[] }) {
  const { t } = useTranslation();

  if (sheets.length === 0) return null;

  return (
    <div className="space-y-4 mt-6">
      {sheets.map((sheet) => (
        <div key={sheet.id} className="space-y-2">
          <p className="text-xs font-bold uppercase text-secondary tracking-wide">
            {t('units.sheet')} {sheet.id}
          </p>
          <div className="aspect-[2/1] bg-surface-container border-2 border-outline-variant rounded-lg overflow-hidden">
            <svg
              viewBox="0 0 2440 1220"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <rect
                x={0}
                y={0}
                width={2440}
                height={1220}
                fill="none"
                stroke="var(--color-outline-variant)"
                strokeWidth={2}
                strokeDasharray="8 4"
              />
              {sheet.pieces.map((piece, idx) => {
                const color = PIECE_COLORS[idx % PIECE_COLORS.length];
                const fontSize = Math.min(piece.width, piece.height) * 0.15;
                const clampedFont = Math.max(24, Math.min(fontSize, 60));

                return (
                  <g key={`${piece.partId}-${idx}`}>
                    <rect
                      x={piece.x}
                      y={piece.y}
                      width={piece.width}
                      height={piece.height}
                      fill={color}
                      fillOpacity={0.2}
                      stroke={color}
                      strokeWidth={3}
                      rx={4}
                    />
                    {piece.width > 80 && piece.height > 50 && (
                      <>
                        <text
                          x={piece.x + piece.width / 2}
                          y={piece.y + piece.height / 2 - clampedFont * 0.3}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="var(--color-on-surface)"
                          fontSize={clampedFont}
                          fontWeight="bold"
                        >
                          {piece.partName}
                        </text>
                        <text
                          x={piece.x + piece.width / 2}
                          y={piece.y + piece.height / 2 + clampedFont * 0.7}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="var(--color-secondary)"
                          fontSize={clampedFont * 0.7}
                        >
                          {piece.width}x{piece.height}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}

function LiveCostSummary({
  materialsCost,
  laborCost,
  subtotal,
  markupAmount,
  discountAmount,
  finalPrice,
  effectiveRate,
  targetHourlyRate,
  meetsTarget,
}: {
  materialsCost: number;
  laborCost: number;
  subtotal: number;
  markupAmount: number;
  discountAmount: number;
  finalPrice: number;
  effectiveRate: number | null;
  targetHourlyRate: number;
  meetsTarget: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-4">
      <div className="sticky top-28">
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(var(--color-outline) 1px, transparent 1px), linear-gradient(90deg, var(--color-outline) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative z-10 space-y-4">
            <SectionHeader icon="monitoring" label={t('calculator.liveFinancialSummary')} />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-secondary text-sm">{t('calculator.materials')}</span>
                <span className="font-mono text-on-surface">
                  {formatCurrency(materialsCost)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary text-sm">{t('calculator.laborCost')}</span>
                <span className="font-mono text-on-surface">
                  {formatCurrency(laborCost)}
                </span>
              </div>

              <hr className="border-outline-variant" />

              <div className="flex justify-between items-center">
                <span className="text-secondary text-sm font-medium">
                  {t('calculator.subtotal')}
                </span>
                <span className="font-mono text-on-surface font-medium">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              {markupAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-secondary text-sm">{t('calculator.markup')}</span>
                  <span className="font-mono text-tertiary">
                    +{formatCurrency(markupAmount)}
                  </span>
                </div>
              )}

              {discountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-secondary text-sm">{t('calculator.discount')}</span>
                  <span className="font-mono text-error">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-on-surface text-surface rounded-xl p-5 mt-4">
              <p className="text-xs uppercase tracking-wide opacity-70 mb-1">
                {t('calculator.finalPrice')}
              </p>
              <p className="font-mono text-3xl font-bold">
                {formatCurrency(finalPrice)}
              </p>
            </div>

            {effectiveRate !== null && (
              <div
                className={`rounded-xl p-4 mt-3 flex items-center justify-between ${
                  meetsTarget
                    ? 'bg-tertiary/10 text-tertiary'
                    : 'bg-error/10 text-error'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    name={meetsTarget ? 'check_circle' : 'error'}
                    className="text-lg"
                  />
                  <div>
                    <p className="text-xs font-medium">
                      {meetsTarget
                        ? t('calculator.meetsTarget')
                        : t('calculator.belowTarget')}
                    </p>
                    <p className="text-[10px] opacity-70">
                      {t('calculator.targetHourlyRate')}: {formatCurrency(targetHourlyRate)}/hr
                    </p>
                  </div>
                </div>
                <p className="font-mono text-lg font-bold">
                  {formatCurrency(effectiveRate)}/hr
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Calculator() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const projects = useStore((s) => s.projects);
  const allMaterials = useStore((s) => s.materials);
  const addProject = useStore((s) => s.addProject);
  const updateProject = useStore((s) => s.updateProject);
  const addTemplate = useStore((s) => s.addTemplate);
  const productTypes = useStore((s) => s.productTypes);
  const settings = useBusinessStore((s) => s.settings);

  const existingProject = id ? projects.find((p) => p.id === id) : undefined;

  const [name, setName] = useState(existingProject?.name ?? '');
  const [buyerName, setBuyerName] = useState(existingProject?.buyerName ?? '');
  const [projectType, setProjectType] = useState(existingProject?.type ?? 'furniture');
  const [description, setDescription] = useState(existingProject?.description ?? '');
  const [date, setDate] = useState(
    existingProject?.date ?? new Date().toISOString().split('T')[0],
  );
  const [status, setStatus] = useState<Status>(existingProject?.status ?? 'lead');
  const [onHold, setOnHold] = useState(existingProject?.onHold ?? false);
  const [productTypeId, setProductTypeId] = useState(
    existingProject?.productTypeId ?? '',
  );
  const [selectedMaterials, setSelectedMaterials] = useState<ProjectMaterial[]>(
    existingProject?.materials ?? [],
  );
  // Per-row helper for sheet materials: enter the used piece's dimensions and
  // the row quantity becomes the proportional fraction of a sheet, so the
  // client pays only for the part actually used. Keyed by row id; presence
  // means the helper is open. Dimensions are in cm (standard sheet: 244x122).
  const [partialSheetRows, setPartialSheetRows] = useState<
    Record<string, PartialSheetState>
  >({});
  const [woodParts, setWoodParts] = useState<WoodPart[]>(
    existingProject?.woodParts ?? [],
  );
  const [laborHours, setLaborHours] = useState(existingProject?.laborHours ?? 0);
  const [hourlyRate, setHourlyRate] = useState(existingProject?.hourlyRate ?? 150);
  const [markupFactor, setMarkupFactor] = useState(existingProject?.markupFactor ?? 1.3);
  const [markupAppliedTo, setMarkupAppliedTo] = useState<MarkupAppliedTo>(
    existingProject?.markupAppliedTo ?? 'materials+labor',
  );
  const [discountPercent, setDiscountPercent] = useState(
    existingProject?.discountPercent ?? 0,
  );
  const [targetHourlyRate, setTargetHourlyRate] = useState(
    settings.targetHourlyRate,
  );

  // Income & payment tracking
  const [quotedPrice, setQuotedPrice] = useState(existingProject?.quotedPrice ?? 0);
  const [agreedPrice, setAgreedPrice] = useState(existingProject?.agreedPrice ?? 0);
  const [depositAmount, setDepositAmount] = useState(
    existingProject?.depositAmount ?? 0,
  );
  const [depositPaidAt, setDepositPaidAt] = useState(
    existingProject?.depositPaidAt ?? '',
  );
  const [balancePaidAt, setBalancePaidAt] = useState(
    existingProject?.balancePaidAt ?? '',
  );
  const [deliveredAt, setDeliveredAt] = useState(existingProject?.deliveredAt ?? '');
  const [actualHours, setActualHours] = useState(existingProject?.actualHours ?? 0);
  const [leadSource, setLeadSource] = useState<LeadSource | ''>(
    existingProject?.leadSource ?? '',
  );

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);

  const materialsCost = useMemo(
    () => calculateMaterialsCost(selectedMaterials, allMaterials),
    [selectedMaterials, allMaterials],
  );

  const materialSummary = useMemo(
    () => summarizeMaterialUsage(selectedMaterials, allMaterials),
    [selectedMaterials, allMaterials],
  );
  // Only worth showing once a material spans more than one line item.
  const hasDuplicateMaterials = materialSummary.length < selectedMaterials.length;

  const laborCost = useMemo(
    () => calculateLaborCost(laborHours, hourlyRate),
    [laborHours, hourlyRate],
  );

  const costBreakdown = useMemo(
    () =>
      calculateFinalPrice({
        materialsCost,
        laborCost,
        markupFactor,
        markupAppliedTo,
        discountPercent,
      }),
    [materialsCost, laborCost, markupFactor, markupAppliedTo, discountPercent],
  );

  const targetRateResult = useMemo(
    () =>
      evaluateTargetHourlyRate({
        price: costBreakdown.finalPrice,
        materialsCost,
        laborHours,
        targetHourlyRate,
      }),
    [costBreakdown.finalPrice, materialsCost, laborHours, targetHourlyRate],
  );

  const packingResult = useMemo(() => {
    if (!isOptimized || woodParts.length === 0) return null;
    const validParts = woodParts.filter(
      (p) => p.lengthMm > 0 && p.widthMm > 0 && p.quantity > 0,
    );
    if (validParts.length === 0) return null;
    return packSheets(validParts);
  }, [woodParts, isOptimized]);

  const totalPartsCount = useMemo(
    () => woodParts.reduce((sum, p) => sum + p.quantity, 0),
    [woodParts],
  );

  const getMaterialById = useCallback(
    (materialId: string) => allMaterials.find((m) => m.id === materialId),
    [allMaterials],
  );

  const getUnitCost = useCallback(
    (pm: ProjectMaterial): number => {
      const material = getMaterialById(pm.materialId);
      if (!material) return 0;
      if (pm.variantId && material.variants) {
        const variant = material.variants.find((v) => v.id === pm.variantId);
        if (variant) return variant.price;
      }
      return material.basePrice;
    },
    [getMaterialById],
  );

  const handleAddMaterial = useCallback((material: Material) => {
    // Each add is its own line item, so two boards of the same size show as two
    // separate rows rather than being merged into one summed quantity.
    setSelectedMaterials((prev) => [
      ...prev,
      {
        id: uuidv4(),
        materialId: material.id,
        variantId: material.variants?.[0]?.id,
        quantity: 1,
      },
    ]);
  }, []);

  const handleRemoveMaterial = useCallback((rowId: string) => {
    setSelectedMaterials((prev) => prev.filter((pm) => pm.id !== rowId));
  }, []);

  const handleMaterialQuantityChange = useCallback(
    (rowId: string, quantity: number) => {
      setSelectedMaterials((prev) =>
        prev.map((pm) =>
          pm.id === rowId ? { ...pm, quantity: Math.max(0, quantity) } : pm,
        ),
      );
    },
    [],
  );

  const handleMaterialVariantChange = useCallback(
    (rowId: string, variantId: string) => {
      // '' is the base-price option; keep it undefined so it isn't persisted
      // as an invalid variant reference.
      setSelectedMaterials((prev) =>
        prev.map((pm) =>
          pm.id === rowId ? { ...pm, variantId: variantId || undefined } : pm,
        ),
      );
    },
    [],
  );

  const handleTogglePartialSheet = useCallback((rowId: string) => {
    setPartialSheetRows((prev) => {
      if (prev[rowId]) {
        const { [rowId]: _removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [rowId]: {
          sheetL: '244',
          sheetW: '122',
          pieces: [emptyPartialSheetPiece()],
        },
      };
    });
  }, []);

  const handlePartialSheetChange = useCallback(
    (rowId: string, state: PartialSheetState) => {
      setPartialSheetRows((prev) => ({ ...prev, [rowId]: state }));
      const fraction = sheetFraction(state);
      if (fraction !== null) {
        handleMaterialQuantityChange(rowId, fraction);
      }
    },
    [handleMaterialQuantityChange],
  );

  const handleAddWoodPart = useCallback(() => {
    setWoodParts((prev) => [
      ...prev,
      { id: uuidv4(), name: '', lengthMm: 0, widthMm: 0, quantity: 1 },
    ]);
    setIsOptimized(false);
  }, []);

  const handleRemoveWoodPart = useCallback((partId: string) => {
    setWoodParts((prev) => prev.filter((p) => p.id !== partId));
    setIsOptimized(false);
  }, []);

  const handleWoodPartChange = useCallback(
    (partId: string, field: keyof WoodPart, value: string | number) => {
      setWoodParts((prev) =>
        prev.map((p) => (p.id === partId ? { ...p, [field]: value } : p)),
      );
      setIsOptimized(false);
    },
    [],
  );

  const handleOptimize = useCallback(() => {
    setIsOptimized(true);
  }, []);

  const handleSave = useCallback(() => {
    const now = new Date().toISOString();
    const project = {
      id: existingProject?.id ?? uuidv4(),
      name,
      type: projectType,
      description: description || undefined,
      date,
      status,
      onHold,
      productTypeId: productTypeId || undefined,
      buyerName: buyerName || undefined,
      materials: selectedMaterials,
      woodParts,
      laborHours,
      hourlyRate,
      markupFactor,
      markupAppliedTo,
      discountPercent,
      quotedPrice: quotedPrice || undefined,
      agreedPrice: agreedPrice || undefined,
      depositAmount: depositAmount || undefined,
      depositPaidAt: depositPaidAt || undefined,
      balancePaidAt: balancePaidAt || undefined,
      deliveredAt: deliveredAt || undefined,
      actualHours: actualHours || undefined,
      leadSource: leadSource || undefined,
      createdAt: existingProject?.createdAt ?? now,
      updatedAt: now,
    };

    if (existingProject) {
      updateProject(project);
    } else {
      addProject(project);
    }
    navigate('/projects');
  }, [
    existingProject,
    name,
    projectType,
    description,
    date,
    status,
    onHold,
    productTypeId,
    buyerName,
    selectedMaterials,
    woodParts,
    laborHours,
    hourlyRate,
    markupFactor,
    markupAppliedTo,
    discountPercent,
    quotedPrice,
    agreedPrice,
    depositAmount,
    depositPaidAt,
    balancePaidAt,
    deliveredAt,
    actualHours,
    leadSource,
    addProject,
    updateProject,
    navigate,
  ]);

  const handleSaveAsTemplate = useCallback(() => {
    const now = new Date().toISOString();
    addTemplate({
      id: uuidv4(),
      name,
      templateName: name,
      templateDescription: description,
      type: projectType,
      productTypeId: productTypeId || undefined,
      materials: selectedMaterials,
      woodParts,
      laborHours,
      hourlyRate,
      markupFactor,
      markupAppliedTo,
      discountPercent,
      createdAt: now,
      updatedAt: now,
    });
    alert(t('calculator.templateSaved'));
  }, [
    name,
    description,
    projectType,
    productTypeId,
    selectedMaterials,
    woodParts,
    laborHours,
    hourlyRate,
    markupFactor,
    markupAppliedTo,
    discountPercent,
    addTemplate,
    t,
  ]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left column */}
      <div className="lg:col-span-8 space-y-10">
        {/* PROJECT INFORMATION */}
        <section className="bg-surface-container rounded-2xl p-6">
          <SectionHeader icon="info" label={t('calculator.projectInfo')} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
                {t('projects.projectName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={INPUT_CLASS}
                placeholder={t('projects.projectName')}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
                {t('calculator.buyerClient')}
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className={INPUT_CLASS}
                placeholder={t('calculator.buyerClient')}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
              {t('calculator.projectType')}
            </label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className={INPUT_CLASS}
            >
              {PROJECT_TYPES.map((pt) => (
                <option key={pt} value={pt}>
                  {t(`projectTypes.${pt}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
              {t('productTypes2.title')}
            </label>
            <select
              value={productTypeId}
              onChange={(e) => setProductTypeId(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">{t('productTypes2.none')}</option>
              {productTypes.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
              {t('materials.description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${INPUT_CLASS} min-h-[80px] resize-y`}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
                {t('calculator.date')}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
                {t('projects.status')}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className={INPUT_CLASS}
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {t(STATUS_TKEY[s])}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 cursor-pointer mt-3">
                <input
                  type="checkbox"
                  checked={onHold}
                  onChange={(e) => setOnHold(e.target.checked)}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm text-on-surface">{t('pipeline.onHold')}</span>
              </label>
            </div>
          </div>
        </section>

        {/* MATERIALS LIST */}
        <section className="bg-surface-container rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Icon name="inventory_2" className="text-primary text-2xl" />
              <h2 className="font-headline font-bold text-lg uppercase tracking-wide text-on-surface">
                {t('calculator.materialsList')}
              </h2>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPickerOpen(!isPickerOpen)}
                className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Icon name="add" className="text-lg" />
                {t('calculator.addFromLibrary')}
              </button>
              {isPickerOpen && (
                <MaterialPicker
                  materials={allMaterials}
                  onSelect={handleAddMaterial}
                  onClose={() => setIsPickerOpen(false)}
                />
              )}
            </div>
          </div>

          {selectedMaterials.length === 0 ? (
            <div className="text-center py-8 text-secondary text-sm">
              {t('calculator.emptyMaterials')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="text-[10px] font-bold uppercase text-secondary text-start pb-2 pe-4">
                      {t('calculator.materialGrade')}
                    </th>
                    <th className="text-[10px] font-bold uppercase text-secondary text-start pb-2 pe-4">
                      {t('calculator.variantSize')}
                    </th>
                    <th className="text-[10px] font-bold uppercase text-secondary text-start pb-2 pe-4">
                      {t('common.qty')}
                    </th>
                    <th className="text-[10px] font-bold uppercase text-secondary text-start pb-2 pe-4">
                      {t('calculator.unitCost')}
                    </th>
                    <th className="text-[10px] font-bold uppercase text-secondary text-start pb-2 pe-4">
                      {t('common.total')}
                    </th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {selectedMaterials.map((pm) => {
                    const material = getMaterialById(pm.materialId);
                    if (!material) return null;
                    const unitCost = getUnitCost(pm);
                    const total = unitCost * pm.quantity;
                    const partialDims =
                      material.unit === 'sheet'
                        ? partialSheetRows[pm.id]
                        : undefined;
                    const partialFraction = partialDims
                      ? sheetFraction(partialDims)
                      : null;

                    return (
                      <Fragment key={pm.id}>
                      <tr
                        className="border-b border-outline-variant/50"
                      >
                        <td className="py-3 pe-4">
                          <span className="text-on-surface text-sm font-medium">
                            {material.name}
                          </span>
                        </td>
                        <td className="py-3 pe-4">
                          {material.variants && material.variants.length > 0 ? (
                            <select
                              value={pm.variantId ?? ''}
                              onChange={(e) =>
                                handleMaterialVariantChange(pm.id, e.target.value)
                              }
                              className="bg-surface-container-highest border-b border-outline px-2 py-1 outline-none text-sm text-on-surface focus:border-primary"
                            >
                              <option value="">
                                {material.basePriceLabel ||
                                  t('materials.baseOption')}
                              </option>
                              {material.variants.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-secondary text-sm">--</span>
                          )}
                        </td>
                        <td className="py-3 pe-4">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleMaterialQuantityChange(
                                  pm.id,
                                  pm.quantity - 1,
                                )
                              }
                              className="w-6 h-6 flex items-center justify-center rounded bg-surface-container-highest hover:bg-surface-container text-secondary shrink-0"
                              aria-label={t('calculator.decreaseQty')}
                            >
                              <Icon name="remove" className="text-sm" />
                            </button>
                            <input
                              type="number"
                              value={pm.quantity}
                              onChange={(e) =>
                                handleMaterialQuantityChange(
                                  pm.id,
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              min={0}
                              step="any"
                              className="bg-surface-container-highest border-b border-outline px-2 py-1 outline-none w-16 font-mono text-sm text-on-surface focus:border-primary text-center"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleMaterialQuantityChange(
                                  pm.id,
                                  pm.quantity + 1,
                                )
                              }
                              className="w-6 h-6 flex items-center justify-center rounded bg-surface-container-highest hover:bg-surface-container text-secondary shrink-0"
                              aria-label={t('calculator.increaseQty')}
                            >
                              <Icon name="add" className="text-sm" />
                            </button>
                            <span className="text-xs text-secondary ms-1">
                              {UNIT_ABBR[material.unit] ?? material.unit}
                            </span>
                            {material.unit === 'sheet' && (
                              <button
                                type="button"
                                onClick={() => handleTogglePartialSheet(pm.id)}
                                className={`w-6 h-6 flex items-center justify-center rounded shrink-0 ms-1 transition-colors ${
                                  partialDims
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-surface-container-highest hover:bg-surface-container text-secondary'
                                }`}
                                title={t('calculator.partialSheet')}
                                aria-label={t('calculator.partialSheet')}
                              >
                                <Icon name="crop" className="text-sm" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pe-4 font-mono text-sm text-secondary">
                          {formatCurrency(unitCost)}
                        </td>
                        <td className="py-3 pe-4 font-mono text-sm font-medium text-primary">
                          {formatCurrency(total)}
                        </td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterial(pm.id)}
                            className="text-error hover:text-error/80 transition-colors"
                          >
                            <Icon name="close" className="text-lg" />
                          </button>
                        </td>
                      </tr>
                      {partialDims && (
                        <tr className="border-b border-outline-variant/50 bg-surface-container-highest/40">
                          <td colSpan={6} className="py-3 px-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                                  {t('calculator.sheetSize')}
                                </span>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    dir="ltr"
                                    value={partialDims.sheetL}
                                    onChange={(e) =>
                                      handlePartialSheetChange(pm.id, {
                                        ...partialDims,
                                        sheetL: e.target.value,
                                      })
                                    }
                                    min={0}
                                    step="any"
                                    placeholder={t('calculator.length')}
                                    className="bg-surface-container-highest border-b border-outline px-2 py-1 outline-none w-20 font-mono text-sm text-on-surface focus:border-primary text-center"
                                  />
                                  <span className="text-secondary">×</span>
                                  <input
                                    type="number"
                                    dir="ltr"
                                    value={partialDims.sheetW}
                                    onChange={(e) =>
                                      handlePartialSheetChange(pm.id, {
                                        ...partialDims,
                                        sheetW: e.target.value,
                                      })
                                    }
                                    min={0}
                                    step="any"
                                    placeholder={t('calculator.width')}
                                    className="bg-surface-container-highest border-b border-outline px-2 py-1 outline-none w-20 font-mono text-sm text-on-surface focus:border-primary text-center"
                                  />
                                </div>
                                {partialFraction !== null && (
                                  <span className="font-mono font-medium text-primary">
                                    ≈ {Math.round(partialFraction * 100)}%{' '}
                                    {t('calculator.ofSheet')}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                                  {t('calculator.pieceSize')}
                                </span>
                              </div>
                              {partialDims.pieces.map((piece) => (
                                <div
                                  key={piece.id}
                                  className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm"
                                >
                                  <input
                                    type="number"
                                    dir="ltr"
                                    value={piece.length}
                                    onChange={(e) =>
                                      handlePartialSheetChange(pm.id, {
                                        ...partialDims,
                                        pieces: partialDims.pieces.map((p) =>
                                          p.id === piece.id
                                            ? { ...p, length: e.target.value }
                                            : p,
                                        ),
                                      })
                                    }
                                    min={0}
                                    step="any"
                                    placeholder={t('calculator.length')}
                                    className="bg-surface-container-highest border-b border-outline px-2 py-1 outline-none w-20 font-mono text-sm text-on-surface focus:border-primary text-center"
                                  />
                                  <span className="text-secondary">×</span>
                                  <input
                                    type="number"
                                    dir="ltr"
                                    value={piece.width}
                                    onChange={(e) =>
                                      handlePartialSheetChange(pm.id, {
                                        ...partialDims,
                                        pieces: partialDims.pieces.map((p) =>
                                          p.id === piece.id
                                            ? { ...p, width: e.target.value }
                                            : p,
                                        ),
                                      })
                                    }
                                    min={0}
                                    step="any"
                                    placeholder={t('calculator.width')}
                                    className="bg-surface-container-highest border-b border-outline px-2 py-1 outline-none w-20 font-mono text-sm text-on-surface focus:border-primary text-center"
                                  />
                                  <span className="text-xs text-secondary ms-2">
                                    {t('common.qty')}
                                  </span>
                                  <input
                                    type="number"
                                    dir="ltr"
                                    value={piece.count}
                                    onChange={(e) =>
                                      handlePartialSheetChange(pm.id, {
                                        ...partialDims,
                                        pieces: partialDims.pieces.map((p) =>
                                          p.id === piece.id
                                            ? { ...p, count: e.target.value }
                                            : p,
                                        ),
                                      })
                                    }
                                    min={1}
                                    step="1"
                                    className="bg-surface-container-highest border-b border-outline px-2 py-1 outline-none w-14 font-mono text-sm text-on-surface focus:border-primary text-center"
                                  />
                                  {partialDims.pieces.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handlePartialSheetChange(pm.id, {
                                          ...partialDims,
                                          pieces: partialDims.pieces.filter(
                                            (p) => p.id !== piece.id,
                                          ),
                                        })
                                      }
                                      className="text-secondary hover:text-error transition-colors w-6 h-6 flex items-center justify-center"
                                      aria-label={t('calculator.removePiece')}
                                    >
                                      <Icon name="close" className="text-sm" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() =>
                                  handlePartialSheetChange(pm.id, {
                                    ...partialDims,
                                    pieces: [
                                      ...partialDims.pieces,
                                      emptyPartialSheetPiece(),
                                    ],
                                  })
                                }
                                className="text-primary text-sm font-medium flex items-center gap-1"
                              >
                                <Icon name="add" className="text-base" />
                                {t('calculator.addPiece')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {hasDuplicateMaterials && (
            <div className="mt-6 border-t border-outline-variant pt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-2">
                {t('calculator.materialTotals')}
              </p>
              <div className="space-y-1">
                {materialSummary.map((row) => (
                  <div
                    key={row.materialId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-on-surface">{row.name}</span>
                    <span className="font-mono text-secondary">
                      {row.totalQuantity} {UNIT_ABBR[row.unit]} ·{' '}
                      {formatCurrency(row.totalCost)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* SHEET OPTIMIZATION */}
        <section className="bg-surface-container rounded-2xl p-6">
          <SectionHeader icon="view_quilt" label={t('calculator.sheetOptimization')} />

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-surface-container-low rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold uppercase text-secondary mb-1">
                {t('calculator.totalParts')}
              </p>
              <p className="font-mono text-2xl font-bold text-on-surface">
                {totalPartsCount}
              </p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold uppercase text-secondary mb-1">
                {t('calculator.wasteYield')}
              </p>
              <p className="font-mono text-2xl font-bold text-on-surface">
                {packingResult ? `${packingResult.wastePercent}%` : '--'}
              </p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold uppercase text-secondary mb-1">
                {t('calculator.sheetsNeeded')}
              </p>
              <p className="font-mono text-2xl font-bold text-on-surface">
                {packingResult ? packingResult.totalSheets : '--'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOptimize}
            disabled={woodParts.length === 0}
            className="mb-6 flex items-center gap-2 bg-tertiary-container text-on-tertiary-container px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Icon name="auto_fix_high" className="text-lg" />
            {t('calculator.optimizeCutList')}
          </button>

          {woodParts.length > 0 && (
            <div className="overflow-x-auto mb-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="text-[10px] font-bold uppercase text-secondary text-start pb-2 pe-4">
                      {t('projectDetails.partName')}
                    </th>
                    <th className="text-[10px] font-bold uppercase text-secondary text-start pb-2 pe-4">
                      {t('projectDetails.lengthMm')}
                    </th>
                    <th className="text-[10px] font-bold uppercase text-secondary text-start pb-2 pe-4">
                      {t('projectDetails.widthMm')}
                    </th>
                    <th className="text-[10px] font-bold uppercase text-secondary text-start pb-2 pe-4">
                      {t('common.qty')}
                    </th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {woodParts.map((part) => (
                    <tr
                      key={part.id}
                      className="border-b border-outline-variant/50"
                    >
                      <td className="py-3 pe-4">
                        <input
                          type="text"
                          value={part.name}
                          onChange={(e) =>
                            handleWoodPartChange(part.id, 'name', e.target.value)
                          }
                          placeholder={t('calculator.partNamePlaceholder')}
                          className="bg-surface-container-highest border-b border-outline px-2 py-1 outline-none text-sm text-on-surface focus:border-primary w-full"
                        />
                      </td>
                      <td className="py-3 pe-4">
                        <input
                          type="number"
                          value={part.lengthMm || ''}
                          onChange={(e) =>
                            handleWoodPartChange(
                              part.id,
                              'lengthMm',
                              parseInt(e.target.value) || 0,
                            )
                          }
                          min={0}
                          className="bg-surface-container-highest border-b border-outline px-2 py-1 outline-none w-24 font-mono text-sm text-on-surface focus:border-primary"
                        />
                      </td>
                      <td className="py-3 pe-4">
                        <input
                          type="number"
                          value={part.widthMm || ''}
                          onChange={(e) =>
                            handleWoodPartChange(
                              part.id,
                              'widthMm',
                              parseInt(e.target.value) || 0,
                            )
                          }
                          min={0}
                          className="bg-surface-container-highest border-b border-outline px-2 py-1 outline-none w-24 font-mono text-sm text-on-surface focus:border-primary"
                        />
                      </td>
                      <td className="py-3 pe-4">
                        <input
                          type="number"
                          value={part.quantity || ''}
                          onChange={(e) =>
                            handleWoodPartChange(
                              part.id,
                              'quantity',
                              parseInt(e.target.value) || 0,
                            )
                          }
                          min={0}
                          className="bg-surface-container-highest border-b border-outline px-2 py-1 outline-none w-20 font-mono text-sm text-on-surface focus:border-primary"
                        />
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveWoodPart(part.id)}
                          className="text-error hover:text-error/80 transition-colors"
                        >
                          <Icon name="delete" className="text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddWoodPart}
            className="w-full border-2 border-dashed border-outline-variant text-secondary hover:border-primary hover:text-primary py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="add" className="text-lg" />
            {t('calculator.addComponent')}
          </button>

          {packingResult && (
            <SheetVisualization sheets={packingResult.sheets} />
          )}
        </section>

        {/* LABOR & ADJUSTMENTS row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LABOR EFFORT */}
          <section className="bg-surface-container rounded-2xl p-6">
            <SectionHeader icon="engineering" label={t('calculator.laborEffort')} />

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
                  {t('calculator.hoursEstimated')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={laborHours || ''}
                    onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                    min={0}
                    step="0.5"
                    dir="ltr"
                    className={`${INPUT_CLASS} pr-14 font-mono`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary text-sm">
                    {t('common.hrs')}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
                  {t('calculator.hourlyRate')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={hourlyRate || ''}
                    onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                    min={0}
                    dir="ltr"
                    className={`${INPUT_CLASS} pr-14 font-mono`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary text-sm">
                    {t('calculator.perHour')}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
                  {t('calculator.targetHourlyRate')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={targetHourlyRate || ''}
                    onChange={(e) =>
                      setTargetHourlyRate(parseFloat(e.target.value) || 0)
                    }
                    min={0}
                    dir="ltr"
                    className={`${INPUT_CLASS} pr-14 font-mono`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary text-sm">
                    {t('calculator.perHour')}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ADJUSTMENTS */}
          <section className="bg-surface-container rounded-2xl p-6">
            <SectionHeader icon="payments" label={t('calculator.adjustments')} />

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
                  {t('calculator.markupMultiplier')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={markupFactor || ''}
                    onChange={(e) => setMarkupFactor(parseFloat(e.target.value) || 1)}
                    min={1}
                    step="0.05"
                    dir="ltr"
                    className={`${INPUT_CLASS} pr-20 font-mono`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary text-sm">
                    {t('calculator.factorSuffix')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="markupAppliedTo"
                    value="materials"
                    checked={markupAppliedTo === 'materials'}
                    onChange={() => setMarkupAppliedTo('materials')}
                    className="accent-primary"
                  />
                  <span className="text-sm text-on-surface">{t('calculator.materialsOnly')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="markupAppliedTo"
                    value="materials+labor"
                    checked={markupAppliedTo === 'materials+labor'}
                    onChange={() => setMarkupAppliedTo('materials+labor')}
                    className="accent-primary"
                  />
                  <span className="text-sm text-on-surface">{t('calculator.materialsPlusLabor')}</span>
                </label>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
                  {t('calculator.loyaltyDiscount')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={discountPercent || ''}
                    onChange={(e) =>
                      setDiscountPercent(parseFloat(e.target.value) || 0)
                    }
                    min={0}
                    max={100}
                    dir="ltr"
                    className={`${INPUT_CLASS} pr-16 font-mono`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary text-sm">
                    % {t('calculator.percentSuffix')}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* INCOME & PAYMENTS */}
        <section className="bg-surface-container rounded-2xl p-6">
          <SectionHeader icon="account_balance_wallet" label={t('income.payments')} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
                {t('income.quotedPrice')}
              </label>
              <input
                type="number"
                value={quotedPrice || ''}
                onChange={(e) => setQuotedPrice(parseFloat(e.target.value) || 0)}
                min={0}
                className={`${INPUT_CLASS} font-mono`}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
                {t('income.agreedPrice')}
              </label>
              <input
                type="number"
                value={agreedPrice || ''}
                onChange={(e) => setAgreedPrice(parseFloat(e.target.value) || 0)}
                min={0}
                className={`${INPUT_CLASS} font-mono`}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
                {t('income.depositAmount')}
              </label>
              <input
                type="number"
                value={depositAmount || ''}
                onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                min={0}
                className={`${INPUT_CLASS} font-mono`}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
                {t('income.actualHours')}
              </label>
              <input
                type="number"
                value={actualHours || ''}
                onChange={(e) => setActualHours(parseFloat(e.target.value) || 0)}
                min={0}
                step="0.5"
                className={`${INPUT_CLASS} font-mono`}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
                {t('income.depositPaid')}
              </label>
              <input
                type="date"
                value={depositPaidAt}
                onChange={(e) => setDepositPaidAt(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
                {t('income.balancePaid')}
              </label>
              <input
                type="date"
                value={balancePaidAt}
                onChange={(e) => setBalancePaidAt(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
                {t('income.delivered')}
              </label>
              <input
                type="date"
                value={deliveredAt}
                onChange={(e) => setDeliveredAt(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-secondary block mb-1">
                {t('income.leadSource')}
              </label>
              <select
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value as LeadSource | '')}
                className={INPUT_CLASS}
              >
                <option value="">{t('income.notSet')}</option>
                {LEAD_SOURCES.map((ls) => (
                  <option key={ls} value={ls}>
                    {t(`leadSource.${ls}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ACTION FOOTER */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Icon name="save" className="text-lg" />
            {t('calculator.saveProject')}
          </button>
          <button
            type="button"
            onClick={handleSaveAsTemplate}
            className="flex items-center gap-2 bg-secondary-container text-on-secondary-container px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Icon name="bookmark" className="text-lg" />
            {t('calculator.saveAsTemplate')}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 border border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/5 transition-colors"
          >
            <Icon name="print" className="text-lg" />
            {t('calculator.printToPdf')}
          </button>
        </div>
      </div>

      {/* Right sidebar - Live Financial Summary */}
      <LiveCostSummary
        materialsCost={costBreakdown.materialsCost}
        laborCost={costBreakdown.laborCost}
        subtotal={costBreakdown.subtotal}
        markupAmount={costBreakdown.markupAmount}
        discountAmount={costBreakdown.discountAmount}
        finalPrice={costBreakdown.finalPrice}
        effectiveRate={targetRateResult.effectiveRate}
        targetHourlyRate={targetHourlyRate}
        meetsTarget={targetRateResult.meets}
      />
    </div>
  );
}
