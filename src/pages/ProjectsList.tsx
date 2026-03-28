import { useState, useMemo } from 'react';
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
import type { Project, Status, Material } from '@/types';

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

const ALL_STATUSES: Status[] = ['planning', 'in-progress', 'completed', 'on-hold'];

function getProjectFinalPrice(project: Project, allMaterials: Material[]): number {
  const materialsCost = calculateMaterialsCost(project.materials, allMaterials);
  const laborCost = calculateLaborCost(project.laborHours, project.hourlyRate);
  const breakdown = calculateFinalPrice({
    materialsCost,
    laborCost,
    markupFactor: project.markupFactor,
    markupAppliedTo: project.markupAppliedTo,
    discountPercent: project.discountPercent,
  });
  return breakdown.finalPrice;
}

function getEstimatedDays(project: Project): string {
  if (project.status === 'completed') return 'FINALIZED';
  const totalHours = project.laborHours;
  const days = Math.ceil(totalHours / 8);
  return `EST: ${days} Days`;
}

function FilterBar({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  categories,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  categories: { id: string; name: string }[];
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-surface-container-low p-6 rounded-xl flex flex-col md:flex-row gap-4 items-stretch md:items-center">
      <div className="flex-1 relative">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-xl" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by project name or material..."
          className="w-full pl-10 pr-4 py-3 bg-surface-container-highest border-b-2 border-outline focus:border-primary outline-none text-sm transition-colors rounded-t"
        />
      </div>
      <select
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full md:w-48 px-4 py-3 bg-surface-container-highest border-b-2 border-outline focus:border-primary outline-none text-sm rounded-t appearance-none cursor-pointer"
      >
        <option value="">{t('projects.allCategories')}</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="w-full md:w-48 px-4 py-3 bg-surface-container-highest border-b-2 border-outline focus:border-primary outline-none text-sm rounded-t appearance-none cursor-pointer"
      >
        <option value="">{t('projects.allStatus')}</option>
        {ALL_STATUSES.map((status) => (
          <option key={status} value={status}>{STATUS_LABELS[status]}</option>
        ))}
      </select>
    </div>
  );
}

function ProjectRow({ project, allMaterials, onNavigate, onDelete }: {
  project: Project;
  allMaterials: Material[];
  onNavigate: (path: string) => void;
  onDelete: (id: string) => void;
}) {
  const finalPrice = getProjectFinalPrice(project, allMaterials);

  return (
    <tr className="group hover:bg-surface-container-low transition-colors">
      <td className="py-4 px-4">
        <div className="w-20 h-20 rounded-lg bg-surface-container-high flex items-center justify-center overflow-hidden">
          {project.photoUrl ? (
            <img
              src={project.photoUrl}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon name="image" className="text-3xl text-secondary/40" />
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <button
          onClick={() => onNavigate(`/projects/${project.id}`)}
          className="text-left hover:text-primary transition-colors"
        >
          <p className="font-bold text-lg">{project.name}</p>
        </button>
        <p className="text-secondary text-xs mt-0.5">
          {project.type}
          {project.description && ` - ${project.description}`}
        </p>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_CLASSES[project.status]}`}>
          {STATUS_LABELS[project.status]}
        </span>
      </td>
      <td className="py-4 px-4">
        <p className="text-sm">{new Date(project.date).toLocaleDateString()}</p>
        <p className="text-xs text-secondary mt-0.5">{getEstimatedDays(project)}</p>
      </td>
      <td className="py-4 px-4">
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container-high rounded text-xs">
            <Icon name="category" className="text-sm" />
            {project.materials.length} Materials
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container-high rounded text-xs">
            <Icon name="schedule" className="text-sm" />
            {project.laborHours}h Labor
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <p className="font-mono text-lg font-bold">{formatCurrency(finalPrice)}</p>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onNavigate(`/projects/${project.id}`)}
            className="p-2 rounded hover:bg-surface-container-high transition-colors"
            aria-label="View project"
          >
            <Icon name="visibility" className="text-xl text-secondary hover:text-on-surface" />
          </button>
          <button
            onClick={() => onNavigate(`/calculator/${project.id}`)}
            className="p-2 rounded hover:bg-surface-container-high transition-colors"
            aria-label="Edit project"
          >
            <Icon name="edit" className="text-xl text-secondary hover:text-on-surface" />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-2 rounded hover:bg-error/10 transition-colors"
            aria-label="Delete project"
          >
            <Icon name="delete" className="text-xl text-secondary hover:text-error" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function WorkshopSummary({ projects, allMaterials }: {
  projects: Project[];
  allMaterials: Material[];
}) {
  const summary = useMemo(() => {
    const inProgressProjects = projects.filter((p) => p.status === 'in-progress');
    const completedProjects = projects.filter((p) => p.status === 'completed');

    const activeValuation = inProgressProjects
      .map((p) => getProjectFinalPrice(p, allMaterials))
      .reduce((sum, v) => sum + v, 0);

    const billableHours = projects.reduce((sum, p) => sum + p.laborHours, 0);

    const efficiencyRate = projects.length > 0
      ? Math.round((completedProjects.length / projects.length) * 100)
      : 0;

    const nextMilestone = inProgressProjects.length > 0
      ? inProgressProjects[0].name
      : null;

    return { activeValuation, billableHours, efficiencyRate, nextMilestone };
  }, [projects, allMaterials]);

  return (
    <div className="glass-panel lg:w-96 p-6 space-y-6 shrink-0">
      <h2 className="font-headline text-lg font-bold uppercase tracking-wide">
        Workshop Summary
      </h2>
      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
            Active Valuation
          </p>
          <p className="font-mono text-3xl font-bold mt-1">
            {formatCurrency(summary.activeValuation)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
            Billable Hours
          </p>
          <p className="font-mono text-3xl font-bold mt-1">{summary.billableHours}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
            Efficiency Rate
          </p>
          <p className="font-mono text-3xl font-bold mt-1">{summary.efficiencyRate}%</p>
        </div>
        {summary.nextMilestone && (
          <div className="bg-primary text-white p-4 rounded-lg">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
              Next Milestone
            </p>
            <p className="font-bold mt-1">{summary.nextMilestone}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProjectsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const projects = useStore((state) => state.projects);
  const materials = useStore((state) => state.materials);
  const categories = useStore((state) => state.categories);
  const deleteProject = useStore((state) => state.deleteProject);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (search) {
        const query = search.toLowerCase();
        const nameMatch = project.name.toLowerCase().includes(query);
        const materialMatch = project.materials.some((pm) => {
          const mat = materials.find((m) => m.id === pm.materialId);
          return mat?.name.toLowerCase().includes(query);
        });
        if (!nameMatch && !materialMatch) return false;
      }

      if (categoryFilter) {
        const projectMaterialCategoryIds = project.materials
          .map((pm) => materials.find((m) => m.id === pm.materialId)?.categoryId)
          .filter(Boolean);
        if (!projectMaterialCategoryIds.includes(categoryFilter)) return false;
      }

      if (statusFilter && project.status !== statusFilter) return false;

      return true;
    });
  }, [projects, materials, search, categoryFilter, statusFilter]);

  const handleDelete = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project && window.confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      deleteProject(id);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-10">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categories={categories}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr>
                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-secondary pb-4 px-4">
                  Preview
                </th>
                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-secondary pb-4 px-4">
                  Project Identity
                </th>
                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-secondary pb-4 px-4">
                  {t('projects.status')}
                </th>
                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-secondary pb-4 px-4">
                  Timeline
                </th>
                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-secondary pb-4 px-4">
                  Metrics
                </th>
                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-secondary pb-4 px-4">
                  Valuation
                </th>
                <th className="text-left text-[10px] font-bold uppercase tracking-widest text-secondary pb-4 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  allMaterials={materials}
                  onNavigate={navigate}
                  onDelete={handleDelete}
                />
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-secondary">
                    No projects match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <WorkshopSummary projects={projects} allMaterials={materials} />
      </div>
    </div>
  );
}
