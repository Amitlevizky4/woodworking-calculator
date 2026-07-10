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
import { STATUS_TKEY } from '@/utils/pipeline';
import { PIPELINE_STAGES } from '@/types';
import type { Material, Project, Status } from '@/types';

function projectValue(project: Project, materials: Material[]): number {
  if (project.agreedPrice) return project.agreedPrice;
  const materialsCost = calculateMaterialsCost(project.materials, materials);
  const laborCost = calculateLaborCost(project.laborHours, project.hourlyRate);
  return calculateFinalPrice({
    materialsCost,
    laborCost,
    markupFactor: project.markupFactor,
    markupAppliedTo: project.markupAppliedTo,
    discountPercent: project.discountPercent,
  }).finalPrice;
}

function PipelineCard({ project, materials }: { project: Project; materials: Material[] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const updateProject = useStore((s) => s.updateProject);

  const changeStatus = (status: Status) => {
    updateProject({ ...project, status });
  };

  const toggleHold = () => {
    updateProject({ ...project, onHold: !project.onHold });
  };

  return (
    <div className="bg-surface-container-low rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="text-start font-bold hover:text-primary transition-colors"
        >
          {project.name}
        </button>
        <span className="font-mono font-bold text-sm whitespace-nowrap">
          {formatCurrency(projectValue(project, materials))}
        </span>
      </div>
      {project.buyerName && (
        <p className="text-xs text-secondary">{project.buyerName}</p>
      )}
      {project.onHold && (
        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-error/10 text-error">
          {t('pipeline.onHold')}
        </span>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={project.status}
          onChange={(e) => changeStatus(e.target.value as Status)}
          className="bg-surface-container-highest border-b-2 border-outline focus:border-primary outline-none px-2 py-1.5 rounded-t text-xs flex-1 min-w-[120px]"
        >
          {PIPELINE_STAGES.map((s) => (
            <option key={s} value={s}>
              {t(STATUS_TKEY[s])}
            </option>
          ))}
        </select>
        <button
          onClick={toggleHold}
          className="text-secondary hover:text-primary transition-colors"
          title={project.onHold ? t('pipeline.resume') : t('pipeline.markOnHold')}
        >
          <Icon name={project.onHold ? 'play_arrow' : 'pause'} className="text-lg" />
        </button>
        <button
          onClick={() => navigate(`/projects/${project.id}/quote`)}
          className="text-secondary hover:text-primary transition-colors"
          title={t('pipeline.quote')}
        >
          <Icon name="request_quote" className="text-lg" />
        </button>
      </div>
    </div>
  );
}

export function Pipeline() {
  const { t } = useTranslation();
  const projects = useStore((s) => s.projects);
  const materials = useStore((s) => s.materials);

  const byStage = useMemo(() => {
    const map = new Map<Status, Project[]>();
    for (const stage of PIPELINE_STAGES) map.set(stage, []);
    for (const project of projects) {
      map.get(project.status)?.push(project);
    }
    return map;
  }, [projects]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="font-headline text-3xl font-bold text-on-surface">
        {t('pipeline.title')}
      </h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PIPELINE_STAGES.map((stage) => {
          const items = byStage.get(stage) ?? [];
          return (
            <div key={stage} className="bg-surface-container rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-sm font-bold uppercase tracking-wide">
                  {t(STATUS_TKEY[stage])}
                </h2>
                <span className="font-mono text-xs text-secondary bg-surface-container-high rounded-full px-2 py-0.5">
                  {items.length}
                </span>
              </div>
              {items.length === 0 ? (
                <p className="text-secondary text-xs py-2">{t('pipeline.empty')}</p>
              ) : (
                items.map((project) => (
                  <PipelineCard key={project.id} project={project} materials={materials} />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
