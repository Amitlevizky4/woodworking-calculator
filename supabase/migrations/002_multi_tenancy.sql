-- ============================================
-- Multi-Tenancy: Shops, Roles & Permissions
-- ============================================

-- ============================================
-- 1. NEW TABLES
-- ============================================

-- SHOPS
create table shops (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table shops enable row level security;

create trigger shops_updated_at before update on shops
  for each row execute function update_updated_at();

-- SHOP MEMBERS
create table shop_members (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('manager', 'member')),
  joined_at timestamptz not null default now(),
  unique(shop_id, user_id)
);

alter table shop_members enable row level security;

create index idx_shop_members_shop_id on shop_members(shop_id);
create index idx_shop_members_user_id on shop_members(user_id);
create index idx_shop_members_user_shop on shop_members(user_id, shop_id);

-- INVITATIONS
create table invitations (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  created_by uuid not null references auth.users(id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  max_uses integer,
  use_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table invitations enable row level security;

create index idx_invitations_token on invitations(token);
create index idx_invitations_shop_id on invitations(shop_id);

-- ADMINS
create table admins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id)
);

alter table admins enable row level security;

-- ============================================
-- 2. HELPER FUNCTIONS
-- ============================================

create or replace function is_admin()
returns boolean as $$
begin
  return exists (select 1 from admins where user_id = auth.uid());
end;
$$ language plpgsql security definer stable;

create or replace function is_shop_member(p_shop_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from shop_members
    where shop_id = p_shop_id and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer stable;

create or replace function is_shop_manager(p_shop_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from shop_members
    where shop_id = p_shop_id and user_id = auth.uid() and role = 'manager'
  );
end;
$$ language plpgsql security definer stable;

-- ============================================
-- 3. DROP OLD RLS POLICIES (must happen before dropping user_id columns)
-- ============================================

-- Categories
drop policy if exists "Users can view own categories" on categories;
drop policy if exists "Users can insert own categories" on categories;
drop policy if exists "Users can update own categories" on categories;
drop policy if exists "Users can delete own categories" on categories;

-- Materials
drop policy if exists "Users can view own materials" on materials;
drop policy if exists "Users can insert own materials" on materials;
drop policy if exists "Users can update own materials" on materials;
drop policy if exists "Users can delete own materials" on materials;

-- Material variants
drop policy if exists "Users can view own material variants" on material_variants;
drop policy if exists "Users can insert own material variants" on material_variants;
drop policy if exists "Users can update own material variants" on material_variants;
drop policy if exists "Users can delete own material variants" on material_variants;

-- Projects
drop policy if exists "Users can view own projects" on projects;
drop policy if exists "Users can insert own projects" on projects;
drop policy if exists "Users can update own projects" on projects;
drop policy if exists "Users can delete own projects" on projects;

-- Project materials
drop policy if exists "Users can view own project materials" on project_materials;
drop policy if exists "Users can insert own project materials" on project_materials;
drop policy if exists "Users can update own project materials" on project_materials;
drop policy if exists "Users can delete own project materials" on project_materials;

-- Wood parts
drop policy if exists "Users can view own wood parts" on wood_parts;
drop policy if exists "Users can insert own wood parts" on wood_parts;
drop policy if exists "Users can update own wood parts" on wood_parts;
drop policy if exists "Users can delete own wood parts" on wood_parts;

-- Templates
drop policy if exists "Users can view own templates" on templates;
drop policy if exists "Users can insert own templates" on templates;
drop policy if exists "Users can update own templates" on templates;
drop policy if exists "Users can delete own templates" on templates;

-- Template materials
drop policy if exists "Users can view own template materials" on template_materials;
drop policy if exists "Users can insert own template materials" on template_materials;
drop policy if exists "Users can update own template materials" on template_materials;
drop policy if exists "Users can delete own template materials" on template_materials;

-- Template wood parts
drop policy if exists "Users can view own template wood parts" on template_wood_parts;
drop policy if exists "Users can insert own template wood parts" on template_wood_parts;
drop policy if exists "Users can update own template wood parts" on template_wood_parts;
drop policy if exists "Users can delete own template wood parts" on template_wood_parts;

-- ============================================
-- 4. ADD shop_id + created_by TO DATA TABLES
-- ============================================

alter table categories add column shop_id uuid references shops(id) on delete cascade;
alter table categories add column created_by uuid references auth.users(id);

alter table materials add column shop_id uuid references shops(id) on delete cascade;
alter table materials add column created_by uuid references auth.users(id);

alter table projects add column shop_id uuid references shops(id) on delete cascade;
alter table projects add column created_by uuid references auth.users(id);

alter table templates add column shop_id uuid references shops(id) on delete cascade;
alter table templates add column created_by uuid references auth.users(id);

-- ============================================
-- 4. MIGRATE EXISTING DATA
-- ============================================

do $$
declare
  r record;
  v_shop_id uuid;
begin
  for r in (
    select distinct user_id from categories
    union select distinct user_id from materials
    union select distinct user_id from projects
    union select distinct user_id from templates
  ) loop
    insert into shops (id, name, description, created_by)
    values (uuid_generate_v4(), 'My Workshop', 'Personal workshop', r.user_id)
    returning id into v_shop_id;

    insert into shop_members (shop_id, user_id, role)
    values (v_shop_id, r.user_id, 'manager');

    update categories set shop_id = v_shop_id, created_by = r.user_id where user_id = r.user_id;
    update materials set shop_id = v_shop_id, created_by = r.user_id where user_id = r.user_id;
    update projects set shop_id = v_shop_id, created_by = r.user_id where user_id = r.user_id;
    update templates set shop_id = v_shop_id, created_by = r.user_id where user_id = r.user_id;
  end loop;
end;
$$;

-- Make shop_id NOT NULL
alter table categories alter column shop_id set not null;
alter table materials alter column shop_id set not null;
alter table projects alter column shop_id set not null;
alter table templates alter column shop_id set not null;

-- Drop old user_id columns
alter table categories drop column user_id;
alter table materials drop column user_id;
alter table projects drop column user_id;
alter table templates drop column user_id;

-- Drop old indexes
drop index if exists idx_categories_user_id;
drop index if exists idx_materials_user_id;
drop index if exists idx_projects_user_id;
drop index if exists idx_templates_user_id;

-- Create new indexes
create index idx_categories_shop_id on categories(shop_id);
create index idx_materials_shop_id on materials(shop_id);
create index idx_projects_shop_id on projects(shop_id);
create index idx_templates_shop_id on templates(shop_id);

-- ============================================
-- 6. NEW RLS POLICIES
-- ============================================

-- === SHOPS ===
create policy "Members can view their shops"
  on shops for select using (is_shop_member(id) or is_admin());
create policy "Authenticated users can create shops"
  on shops for insert with check (auth.uid() = created_by);
create policy "Managers can update shops"
  on shops for update using (is_shop_manager(id) or is_admin());
create policy "Managers can delete shops"
  on shops for delete using (is_shop_manager(id) or is_admin());

-- === SHOP MEMBERS ===
create policy "Members can view shop members"
  on shop_members for select using (is_shop_member(shop_id) or is_admin());
create policy "Managers can add members"
  on shop_members for insert with check (is_shop_manager(shop_id) or is_admin());
create policy "Managers can update member roles"
  on shop_members for update using (is_shop_manager(shop_id) or is_admin());
create policy "Managers can remove members"
  on shop_members for delete using (is_shop_manager(shop_id) or is_admin());

-- === INVITATIONS ===
create policy "Managers can view invitations"
  on invitations for select using (is_shop_manager(shop_id) or is_admin());
create policy "Managers can create invitations"
  on invitations for insert with check (is_shop_manager(shop_id) or is_admin());
create policy "Managers can update invitations"
  on invitations for update using (is_shop_manager(shop_id) or is_admin());
create policy "Managers can delete invitations"
  on invitations for delete using (is_shop_manager(shop_id) or is_admin());

-- === ADMINS ===
create policy "Users can check own admin status"
  on admins for select using (auth.uid() = user_id);
create policy "Admins can view all admins"
  on admins for select using (is_admin());
create policy "Admins can manage admins"
  on admins for insert with check (is_admin());
create policy "Admins can remove admins"
  on admins for delete using (is_admin());

-- === CATEGORIES ===
create policy "Shop members can view categories"
  on categories for select using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can insert categories"
  on categories for insert with check (is_shop_member(shop_id) or is_admin());
create policy "Shop members can update categories"
  on categories for update using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can delete categories"
  on categories for delete using (is_shop_member(shop_id) or is_admin());

-- === MATERIALS ===
create policy "Shop members can view materials"
  on materials for select using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can insert materials"
  on materials for insert with check (is_shop_member(shop_id) or is_admin());
create policy "Shop members can update materials"
  on materials for update using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can delete materials"
  on materials for delete using (is_shop_member(shop_id) or is_admin());

-- === MATERIAL VARIANTS ===
create policy "Shop members can view material variants"
  on material_variants for select using (exists (
    select 1 from materials where materials.id = material_variants.material_id
    and (is_shop_member(materials.shop_id) or is_admin())
  ));
create policy "Shop members can insert material variants"
  on material_variants for insert with check (exists (
    select 1 from materials where materials.id = material_variants.material_id
    and (is_shop_member(materials.shop_id) or is_admin())
  ));
create policy "Shop members can update material variants"
  on material_variants for update using (exists (
    select 1 from materials where materials.id = material_variants.material_id
    and (is_shop_member(materials.shop_id) or is_admin())
  ));
create policy "Shop members can delete material variants"
  on material_variants for delete using (exists (
    select 1 from materials where materials.id = material_variants.material_id
    and (is_shop_member(materials.shop_id) or is_admin())
  ));

-- === PROJECTS ===
create policy "Shop members can view projects"
  on projects for select using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can insert projects"
  on projects for insert with check (is_shop_member(shop_id) or is_admin());
create policy "Shop members can update projects"
  on projects for update using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can delete projects"
  on projects for delete using (is_shop_member(shop_id) or is_admin());

-- === PROJECT MATERIALS ===
create policy "Shop members can view project materials"
  on project_materials for select using (exists (
    select 1 from projects where projects.id = project_materials.project_id
    and (is_shop_member(projects.shop_id) or is_admin())
  ));
create policy "Shop members can insert project materials"
  on project_materials for insert with check (exists (
    select 1 from projects where projects.id = project_materials.project_id
    and (is_shop_member(projects.shop_id) or is_admin())
  ));
create policy "Shop members can update project materials"
  on project_materials for update using (exists (
    select 1 from projects where projects.id = project_materials.project_id
    and (is_shop_member(projects.shop_id) or is_admin())
  ));
create policy "Shop members can delete project materials"
  on project_materials for delete using (exists (
    select 1 from projects where projects.id = project_materials.project_id
    and (is_shop_member(projects.shop_id) or is_admin())
  ));

-- === WOOD PARTS ===
create policy "Shop members can view wood parts"
  on wood_parts for select using (exists (
    select 1 from projects where projects.id = wood_parts.project_id
    and (is_shop_member(projects.shop_id) or is_admin())
  ));
create policy "Shop members can insert wood parts"
  on wood_parts for insert with check (exists (
    select 1 from projects where projects.id = wood_parts.project_id
    and (is_shop_member(projects.shop_id) or is_admin())
  ));
create policy "Shop members can update wood parts"
  on wood_parts for update using (exists (
    select 1 from projects where projects.id = wood_parts.project_id
    and (is_shop_member(projects.shop_id) or is_admin())
  ));
create policy "Shop members can delete wood parts"
  on wood_parts for delete using (exists (
    select 1 from projects where projects.id = wood_parts.project_id
    and (is_shop_member(projects.shop_id) or is_admin())
  ));

-- === TEMPLATES ===
create policy "Shop members can view templates"
  on templates for select using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can insert templates"
  on templates for insert with check (is_shop_member(shop_id) or is_admin());
create policy "Shop members can update templates"
  on templates for update using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can delete templates"
  on templates for delete using (is_shop_member(shop_id) or is_admin());

-- === TEMPLATE MATERIALS ===
create policy "Shop members can view template materials"
  on template_materials for select using (exists (
    select 1 from templates where templates.id = template_materials.template_id
    and (is_shop_member(templates.shop_id) or is_admin())
  ));
create policy "Shop members can insert template materials"
  on template_materials for insert with check (exists (
    select 1 from templates where templates.id = template_materials.template_id
    and (is_shop_member(templates.shop_id) or is_admin())
  ));
create policy "Shop members can update template materials"
  on template_materials for update using (exists (
    select 1 from templates where templates.id = template_materials.template_id
    and (is_shop_member(templates.shop_id) or is_admin())
  ));
create policy "Shop members can delete template materials"
  on template_materials for delete using (exists (
    select 1 from templates where templates.id = template_materials.template_id
    and (is_shop_member(templates.shop_id) or is_admin())
  ));

-- === TEMPLATE WOOD PARTS ===
create policy "Shop members can view template wood parts"
  on template_wood_parts for select using (exists (
    select 1 from templates where templates.id = template_wood_parts.template_id
    and (is_shop_member(templates.shop_id) or is_admin())
  ));
create policy "Shop members can insert template wood parts"
  on template_wood_parts for insert with check (exists (
    select 1 from templates where templates.id = template_wood_parts.template_id
    and (is_shop_member(templates.shop_id) or is_admin())
  ));
create policy "Shop members can update template wood parts"
  on template_wood_parts for update using (exists (
    select 1 from templates where templates.id = template_wood_parts.template_id
    and (is_shop_member(templates.shop_id) or is_admin())
  ));
create policy "Shop members can delete template wood parts"
  on template_wood_parts for delete using (exists (
    select 1 from templates where templates.id = template_wood_parts.template_id
    and (is_shop_member(templates.shop_id) or is_admin())
  ));

-- ============================================
-- 7. PREVENT LAST MANAGER REMOVAL
-- ============================================

create or replace function prevent_last_manager_removal()
returns trigger as $$
declare
  v_manager_count integer;
begin
  if old.role = 'manager' then
    select count(*) into v_manager_count
    from shop_members
    where shop_id = old.shop_id and role = 'manager' and id != old.id;

    if v_manager_count = 0 then
      raise exception 'Cannot remove the last manager from a shop';
    end if;
  end if;
  return old;
end;
$$ language plpgsql;

create trigger check_last_manager_delete
  before delete on shop_members
  for each row execute function prevent_last_manager_removal();

create or replace function prevent_last_manager_demotion()
returns trigger as $$
declare
  v_manager_count integer;
begin
  if old.role = 'manager' and new.role = 'member' then
    select count(*) into v_manager_count
    from shop_members
    where shop_id = old.shop_id and role = 'manager' and id != old.id;

    if v_manager_count = 0 then
      raise exception 'Cannot demote the last manager of a shop';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger check_last_manager_update
  before update on shop_members
  for each row execute function prevent_last_manager_demotion();

-- ============================================
-- 8. RPC FUNCTIONS
-- ============================================

-- Seed shop data (replaces seed_user_data)
create or replace function seed_shop_data(p_shop_id uuid)
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
  if exists (select 1 from categories where shop_id = p_shop_id) then
    return;
  end if;

  -- Categories
  insert into categories (id, shop_id, name, color, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Wood', '#8B5E3C', auth.uid()) returning id into v_wood_cat_id;
  insert into categories (id, shop_id, name, color, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Finishes', '#4A7C6F', auth.uid()) returning id into v_finishes_cat_id;
  insert into categories (id, shop_id, name, color, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Hardware', '#6B7C5C', auth.uid()) returning id into v_hardware_cat_id;

  -- Materials
  insert into materials (id, shop_id, name, category_id, unit, base_price, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Plywood 18mm', v_wood_cat_id, 'sheet', 185, auth.uid()) returning id into v_plywood_id;
  insert into materials (id, shop_id, name, category_id, unit, base_price, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Pine Board', v_wood_cat_id, 'meter', 45, auth.uid()) returning id into v_pine_id;
  insert into materials (id, shop_id, name, category_id, unit, base_price, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Oak Board', v_wood_cat_id, 'meter', 120, auth.uid()) returning id into v_oak_id;
  insert into materials (id, shop_id, name, category_id, unit, base_price, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Wood Stain', v_finishes_cat_id, 'liter', 85, auth.uid()) returning id into v_stain_id;
  insert into materials (id, shop_id, name, category_id, unit, base_price, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Wood Screws', v_hardware_cat_id, 'piece', 0.50, auth.uid()) returning id into v_screws_id;
  insert into materials (id, shop_id, name, category_id, unit, base_price, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Sandpaper', v_hardware_cat_id, 'piece', 8, auth.uid()) returning id into v_sandpaper_id;

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
  insert into projects (id, shop_id, name, type, description, date, status, buyer_name, labor_hours, hourly_rate, markup_factor, markup_applied_to, discount_percent, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Walnut Dining Table', 'table', 'Custom walnut dining table for 6 people', '2026-02-15', 'completed', 'David Cohen', 24, 150, 1.3, 'materials+labor', 5, auth.uid())
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
  insert into projects (id, shop_id, name, type, description, date, status, labor_hours, hourly_rate, markup_factor, markup_applied_to, discount_percent, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Floating Shelves Set', 'shelf', 'Set of 4 floating oak shelves with hidden brackets', '2026-03-20', 'in-progress', 8, 150, 1.2, 'materials', 0, auth.uid())
    returning id into v_project2_id;

  insert into project_materials (project_id, material_id, variant_id, quantity) values
    (v_project2_id, v_oak_id, null, 3),
    (v_project2_id, v_sandpaper_id, v_sand_120_var, 5),
    (v_project2_id, v_stain_id, null, 0.5);

  insert into wood_parts (project_id, name, length_mm, width_mm, quantity) values
    (v_project2_id, 'Shelf', 800, 300, 4),
    (v_project2_id, 'Bracket', 50, 300, 8);

  -- Template 1: Basic Shelf Unit
  insert into templates (id, shop_id, name, template_name, template_description, type, labor_hours, hourly_rate, markup_factor, markup_applied_to, discount_percent, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Basic Shelf Unit', 'Basic Shelf Unit', 'Simple shelf unit with 3 shelves and 2 side panels', 'shelf', 6, 150, 1.25, 'materials+labor', 0, auth.uid())
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

-- Create shop helper
create or replace function create_shop(p_name text, p_description text default null, p_seed boolean default true)
returns uuid as $$
declare
  v_shop_id uuid;
begin
  insert into shops (name, description, created_by)
  values (p_name, p_description, auth.uid())
  returning id into v_shop_id;

  insert into shop_members (shop_id, user_id, role)
  values (v_shop_id, auth.uid(), 'manager');

  if p_seed then
    perform seed_shop_data(v_shop_id);
  end if;

  return v_shop_id;
end;
$$ language plpgsql security definer;

-- Accept invitation
create or replace function accept_invitation(p_token text)
returns json as $$
declare
  v_invitation record;
  v_existing record;
begin
  select * into v_invitation from invitations
  where token = p_token
    and expires_at > now()
    and (max_uses is null or use_count < max_uses);

  if v_invitation is null then
    return json_build_object('error', 'Invalid or expired invitation');
  end if;

  select * into v_existing from shop_members
  where shop_id = v_invitation.shop_id and user_id = auth.uid();

  if v_existing is not null then
    return json_build_object('error', 'Already a member', 'shop_id', v_invitation.shop_id);
  end if;

  insert into shop_members (shop_id, user_id, role)
  values (v_invitation.shop_id, auth.uid(), 'member');

  update invitations set use_count = use_count + 1 where id = v_invitation.id;

  return json_build_object('success', true, 'shop_id', v_invitation.shop_id);
end;
$$ language plpgsql security definer;

-- ============================================
-- 9. SEED INITIAL ADMIN
-- ============================================

insert into admins (user_id)
select id from auth.users where email = 'amit.levizky@gmail.com'
on conflict do nothing;
