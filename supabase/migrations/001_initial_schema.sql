-- ============================================
-- Woodworking Cost Calculator - Database Schema
-- Supabase PostgreSQL with Row Level Security
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- CATEGORIES
-- ============================================
create table categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  color text not null default '#8B5E3C',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table categories enable row level security;

create policy "Users can view own categories"
  on categories for select using (auth.uid() = user_id);
create policy "Users can insert own categories"
  on categories for insert with check (auth.uid() = user_id);
create policy "Users can update own categories"
  on categories for update using (auth.uid() = user_id);
create policy "Users can delete own categories"
  on categories for delete using (auth.uid() = user_id);

-- ============================================
-- MATERIALS
-- ============================================
create table materials (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category_id uuid references categories(id) on delete set null,
  unit text not null check (unit in ('meter', 'sheet', 'liter', 'piece', 'kg', 'm2')),
  base_price numeric(12, 2) not null default 0,
  description text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table materials enable row level security;

create policy "Users can view own materials"
  on materials for select using (auth.uid() = user_id);
create policy "Users can insert own materials"
  on materials for insert with check (auth.uid() = user_id);
create policy "Users can update own materials"
  on materials for update using (auth.uid() = user_id);
create policy "Users can delete own materials"
  on materials for delete using (auth.uid() = user_id);

-- ============================================
-- MATERIAL VARIANTS
-- ============================================
create table material_variants (
  id uuid primary key default uuid_generate_v4(),
  material_id uuid not null references materials(id) on delete cascade,
  label text not null,
  price numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table material_variants enable row level security;

create policy "Users can view own material variants"
  on material_variants for select
  using (exists (
    select 1 from materials where materials.id = material_variants.material_id and materials.user_id = auth.uid()
  ));
create policy "Users can insert own material variants"
  on material_variants for insert
  with check (exists (
    select 1 from materials where materials.id = material_variants.material_id and materials.user_id = auth.uid()
  ));
create policy "Users can update own material variants"
  on material_variants for update
  using (exists (
    select 1 from materials where materials.id = material_variants.material_id and materials.user_id = auth.uid()
  ));
create policy "Users can delete own material variants"
  on material_variants for delete
  using (exists (
    select 1 from materials where materials.id = material_variants.material_id and materials.user_id = auth.uid()
  ));

-- ============================================
-- PROJECTS
-- ============================================
create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'custom',
  description text,
  date date,
  status text not null default 'planning' check (status in ('planning', 'in-progress', 'completed', 'on-hold')),
  buyer_name text,
  platform text,
  labor_hours numeric(8, 2) not null default 0,
  hourly_rate numeric(8, 2) not null default 0,
  markup_factor numeric(5, 2) not null default 1.0,
  markup_applied_to text not null default 'materials' check (markup_applied_to in ('materials', 'materials+labor')),
  discount_percent numeric(5, 2) not null default 0,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table projects enable row level security;

create policy "Users can view own projects"
  on projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects"
  on projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects"
  on projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects"
  on projects for delete using (auth.uid() = user_id);

-- ============================================
-- PROJECT MATERIALS (join table)
-- ============================================
create table project_materials (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  material_id uuid not null references materials(id) on delete cascade,
  variant_id uuid references material_variants(id) on delete set null,
  quantity numeric(10, 2) not null default 0
);

alter table project_materials enable row level security;

create policy "Users can view own project materials"
  on project_materials for select
  using (exists (
    select 1 from projects where projects.id = project_materials.project_id and projects.user_id = auth.uid()
  ));
create policy "Users can insert own project materials"
  on project_materials for insert
  with check (exists (
    select 1 from projects where projects.id = project_materials.project_id and projects.user_id = auth.uid()
  ));
create policy "Users can update own project materials"
  on project_materials for update
  using (exists (
    select 1 from projects where projects.id = project_materials.project_id and projects.user_id = auth.uid()
  ));
create policy "Users can delete own project materials"
  on project_materials for delete
  using (exists (
    select 1 from projects where projects.id = project_materials.project_id and projects.user_id = auth.uid()
  ));

-- ============================================
-- WOOD PARTS
-- ============================================
create table wood_parts (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  length_mm numeric(10, 2) not null default 0,
  width_mm numeric(10, 2) not null default 0,
  quantity integer not null default 1
);

alter table wood_parts enable row level security;

create policy "Users can view own wood parts"
  on wood_parts for select
  using (exists (
    select 1 from projects where projects.id = wood_parts.project_id and projects.user_id = auth.uid()
  ));
create policy "Users can insert own wood parts"
  on wood_parts for insert
  with check (exists (
    select 1 from projects where projects.id = wood_parts.project_id and projects.user_id = auth.uid()
  ));
create policy "Users can update own wood parts"
  on wood_parts for update
  using (exists (
    select 1 from projects where projects.id = wood_parts.project_id and projects.user_id = auth.uid()
  ));
create policy "Users can delete own wood parts"
  on wood_parts for delete
  using (exists (
    select 1 from projects where projects.id = wood_parts.project_id and projects.user_id = auth.uid()
  ));

-- ============================================
-- TEMPLATES
-- ============================================
create table templates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  template_name text not null,
  template_description text,
  type text not null default 'custom',
  description text,
  labor_hours numeric(8, 2) not null default 0,
  hourly_rate numeric(8, 2) not null default 0,
  markup_factor numeric(5, 2) not null default 1.0,
  markup_applied_to text not null default 'materials' check (markup_applied_to in ('materials', 'materials+labor')),
  discount_percent numeric(5, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table templates enable row level security;

create policy "Users can view own templates"
  on templates for select using (auth.uid() = user_id);
create policy "Users can insert own templates"
  on templates for insert with check (auth.uid() = user_id);
create policy "Users can update own templates"
  on templates for update using (auth.uid() = user_id);
create policy "Users can delete own templates"
  on templates for delete using (auth.uid() = user_id);

-- ============================================
-- TEMPLATE MATERIALS (join table)
-- ============================================
create table template_materials (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid not null references templates(id) on delete cascade,
  material_id uuid not null references materials(id) on delete cascade,
  variant_id uuid references material_variants(id) on delete set null,
  quantity numeric(10, 2) not null default 0
);

alter table template_materials enable row level security;

create policy "Users can view own template materials"
  on template_materials for select
  using (exists (
    select 1 from templates where templates.id = template_materials.template_id and templates.user_id = auth.uid()
  ));
create policy "Users can insert own template materials"
  on template_materials for insert
  with check (exists (
    select 1 from templates where templates.id = template_materials.template_id and templates.user_id = auth.uid()
  ));
create policy "Users can update own template materials"
  on template_materials for update
  using (exists (
    select 1 from templates where templates.id = template_materials.template_id and templates.user_id = auth.uid()
  ));
create policy "Users can delete own template materials"
  on template_materials for delete
  using (exists (
    select 1 from templates where templates.id = template_materials.template_id and templates.user_id = auth.uid()
  ));

-- ============================================
-- TEMPLATE WOOD PARTS
-- ============================================
create table template_wood_parts (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid not null references templates(id) on delete cascade,
  name text not null,
  length_mm numeric(10, 2) not null default 0,
  width_mm numeric(10, 2) not null default 0,
  quantity integer not null default 1
);

alter table template_wood_parts enable row level security;

create policy "Users can view own template wood parts"
  on template_wood_parts for select
  using (exists (
    select 1 from templates where templates.id = template_wood_parts.template_id and templates.user_id = auth.uid()
  ));
create policy "Users can insert own template wood parts"
  on template_wood_parts for insert
  with check (exists (
    select 1 from templates where templates.id = template_wood_parts.template_id and templates.user_id = auth.uid()
  ));
create policy "Users can update own template wood parts"
  on template_wood_parts for update
  using (exists (
    select 1 from templates where templates.id = template_wood_parts.template_id and templates.user_id = auth.uid()
  ));
create policy "Users can delete own template wood parts"
  on template_wood_parts for delete
  using (exists (
    select 1 from templates where templates.id = template_wood_parts.template_id and templates.user_id = auth.uid()
  ));

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger categories_updated_at before update on categories for each row execute function update_updated_at();
create trigger materials_updated_at before update on materials for each row execute function update_updated_at();
create trigger projects_updated_at before update on projects for each row execute function update_updated_at();
create trigger templates_updated_at before update on templates for each row execute function update_updated_at();

-- ============================================
-- INDEXES
-- ============================================
create index idx_categories_user_id on categories(user_id);
create index idx_materials_user_id on materials(user_id);
create index idx_materials_category_id on materials(category_id);
create index idx_projects_user_id on projects(user_id);
create index idx_projects_status on projects(status);
create index idx_project_materials_project_id on project_materials(project_id);
create index idx_wood_parts_project_id on wood_parts(project_id);
create index idx_templates_user_id on templates(user_id);
create index idx_template_materials_template_id on template_materials(template_id);
create index idx_template_wood_parts_template_id on template_wood_parts(template_id);

-- ============================================
-- SEED DATA FUNCTION (called per user on first login)
-- ============================================
create or replace function seed_user_data(p_user_id uuid)
returns void as $$
declare
  v_wood_cat_id uuid;
  v_finishes_cat_id uuid;
  v_hardware_cat_id uuid;
  v_plywood_id uuid;
  v_pine_id uuid;
  v_oak_id uuid;
  v_stain_id uuid;
  v_screws_id uuid;
  v_sandpaper_id uuid;
  v_project1_id uuid;
  v_project2_id uuid;
  v_template1_id uuid;
  v_plywood_std_var uuid;
  v_plywood_prm_var uuid;
  v_pine_2x4_var uuid;
  v_pine_2x6_var uuid;
  v_screws_30_var uuid;
  v_screws_50_var uuid;
  v_screws_70_var uuid;
  v_sand_80_var uuid;
  v_sand_120_var uuid;
  v_sand_220_var uuid;
begin
  -- Check if user already has data
  if exists (select 1 from categories where user_id = p_user_id) then
    return;
  end if;

  -- Categories
  insert into categories (id, user_id, name, color) values
    (uuid_generate_v4(), p_user_id, 'Wood', '#8B5E3C') returning id into v_wood_cat_id;
  insert into categories (id, user_id, name, color) values
    (uuid_generate_v4(), p_user_id, 'Finishes', '#4A7C6F') returning id into v_finishes_cat_id;
  insert into categories (id, user_id, name, color) values
    (uuid_generate_v4(), p_user_id, 'Hardware', '#6B7C5C') returning id into v_hardware_cat_id;

  -- Materials
  insert into materials (id, user_id, name, category_id, unit, base_price) values
    (uuid_generate_v4(), p_user_id, 'Plywood 18mm', v_wood_cat_id, 'sheet', 185) returning id into v_plywood_id;
  insert into materials (id, user_id, name, category_id, unit, base_price) values
    (uuid_generate_v4(), p_user_id, 'Pine Board', v_wood_cat_id, 'meter', 45) returning id into v_pine_id;
  insert into materials (id, user_id, name, category_id, unit, base_price) values
    (uuid_generate_v4(), p_user_id, 'Oak Board', v_wood_cat_id, 'meter', 120) returning id into v_oak_id;
  insert into materials (id, user_id, name, category_id, unit, base_price) values
    (uuid_generate_v4(), p_user_id, 'Wood Stain', v_finishes_cat_id, 'liter', 85) returning id into v_stain_id;
  insert into materials (id, user_id, name, category_id, unit, base_price) values
    (uuid_generate_v4(), p_user_id, 'Wood Screws', v_hardware_cat_id, 'piece', 0.50) returning id into v_screws_id;
  insert into materials (id, user_id, name, category_id, unit, base_price) values
    (uuid_generate_v4(), p_user_id, 'Sandpaper', v_hardware_cat_id, 'piece', 8) returning id into v_sandpaper_id;

  -- Variants
  insert into material_variants (id, material_id, label, price) values
    (uuid_generate_v4(), v_plywood_id, 'Standard', 185) returning id into v_plywood_std_var;
  insert into material_variants (id, material_id, label, price) values
    (uuid_generate_v4(), v_plywood_id, 'Premium Birch', 245) returning id into v_plywood_prm_var;
  insert into material_variants (id, material_id, label, price) values
    (uuid_generate_v4(), v_pine_id, '2x4', 45) returning id into v_pine_2x4_var;
  insert into material_variants (id, material_id, label, price) values
    (uuid_generate_v4(), v_pine_id, '2x6', 65) returning id into v_pine_2x6_var;
  insert into material_variants (id, material_id, label, price) values
    (uuid_generate_v4(), v_screws_id, '30mm', 0.50) returning id into v_screws_30_var;
  insert into material_variants (id, material_id, label, price) values
    (uuid_generate_v4(), v_screws_id, '50mm', 0.75) returning id into v_screws_50_var;
  insert into material_variants (id, material_id, label, price) values
    (uuid_generate_v4(), v_screws_id, '70mm', 1.00) returning id into v_screws_70_var;
  insert into material_variants (id, material_id, label, price) values
    (uuid_generate_v4(), v_sandpaper_id, '80 Grit', 8) returning id into v_sand_80_var;
  insert into material_variants (id, material_id, label, price) values
    (uuid_generate_v4(), v_sandpaper_id, '120 Grit', 8) returning id into v_sand_120_var;
  insert into material_variants (id, material_id, label, price) values
    (uuid_generate_v4(), v_sandpaper_id, '220 Grit', 10) returning id into v_sand_220_var;

  -- Project 1: Walnut Dining Table (completed)
  insert into projects (id, user_id, name, type, description, date, status, buyer_name, labor_hours, hourly_rate, markup_factor, markup_applied_to, discount_percent) values
    (uuid_generate_v4(), p_user_id, 'Walnut Dining Table', 'table', 'Custom walnut dining table for 6 people', '2026-02-15', 'completed', 'David Cohen', 24, 150, 1.3, 'materials+labor', 5)
    returning id into v_project1_id;

  insert into project_materials (project_id, material_id, variant_id, quantity) values
    (v_project1_id, v_plywood_id, v_plywood_std_var, 2),
    (v_project1_id, v_pine_id, v_pine_2x4_var, 4),
    (v_project1_id, v_stain_id, null, 1),
    (v_project1_id, v_screws_id, v_screws_30_var, 50);

  insert into wood_parts (project_id, name, length_mm, width_mm, quantity) values
    (v_project1_id, 'Top', 1800, 900, 1),
    (v_project1_id, 'Leg', 100, 700, 4),
    (v_project1_id, 'Support Beam', 1600, 100, 2);

  -- Project 2: Floating Shelves Set (in-progress)
  insert into projects (id, user_id, name, type, description, date, status, labor_hours, hourly_rate, markup_factor, markup_applied_to, discount_percent) values
    (uuid_generate_v4(), p_user_id, 'Floating Shelves Set', 'shelf', 'Set of 4 floating oak shelves with hidden brackets', '2026-03-20', 'in-progress', 8, 150, 1.2, 'materials', 0)
    returning id into v_project2_id;

  insert into project_materials (project_id, material_id, variant_id, quantity) values
    (v_project2_id, v_oak_id, null, 3),
    (v_project2_id, v_sandpaper_id, v_sand_120_var, 5),
    (v_project2_id, v_stain_id, null, 0.5);

  insert into wood_parts (project_id, name, length_mm, width_mm, quantity) values
    (v_project2_id, 'Shelf', 800, 300, 4),
    (v_project2_id, 'Bracket', 50, 300, 8);

  -- Template 1: Basic Shelf Unit
  insert into templates (id, user_id, name, template_name, template_description, type, labor_hours, hourly_rate, markup_factor, markup_applied_to, discount_percent) values
    (uuid_generate_v4(), p_user_id, 'Basic Shelf Unit', 'Basic Shelf Unit', 'Simple shelf unit with 3 shelves and 2 side panels', 'shelf', 6, 150, 1.25, 'materials+labor', 0)
    returning id into v_template1_id;

  insert into template_materials (template_id, material_id, variant_id, quantity) values
    (v_template1_id, v_pine_id, v_pine_2x4_var, 6),
    (v_template1_id, v_screws_id, v_screws_30_var, 40),
    (v_template1_id, v_sandpaper_id, v_sand_120_var, 3);

  insert into template_wood_parts (template_id, name, length_mm, width_mm, quantity) values
    (v_template1_id, 'Shelf', 600, 250, 3),
    (v_template1_id, 'Side Panel', 600, 300, 2);

end;
$$ language plpgsql security definer;
