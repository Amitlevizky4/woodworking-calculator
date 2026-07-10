-- ============================================
-- Phase 2: Order Pipeline, Product Types, Time Logs, Channel ROI
-- ============================================

-- ============================================
-- 1. PRODUCT TYPES (shop-scoped, like categories)
-- ============================================

create table product_types (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  created_by uuid references auth.users(id),
  name text not null,
  color text not null default '#8f7066',
  created_at timestamptz not null default now()
);

alter table product_types enable row level security;

create index idx_product_types_shop_id on product_types(shop_id);

create policy "Shop members can view product types"
  on product_types for select using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can insert product types"
  on product_types for insert with check (is_shop_member(shop_id) or is_admin());
create policy "Shop members can update product types"
  on product_types for update using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can delete product types"
  on product_types for delete using (is_shop_member(shop_id) or is_admin());

-- ============================================
-- 2. TIME LOGS (per project, feeds effective hourly rate & profitability)
-- ============================================

create table time_logs (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  created_by uuid references auth.users(id),
  date date not null,
  hours numeric(6, 2) not null,
  note text,
  created_at timestamptz not null default now()
);

alter table time_logs enable row level security;

create index idx_time_logs_shop_id on time_logs(shop_id);
create index idx_time_logs_project_id on time_logs(project_id);

create policy "Shop members can view time logs"
  on time_logs for select using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can insert time logs"
  on time_logs for insert with check (is_shop_member(shop_id) or is_admin());
create policy "Shop members can update time logs"
  on time_logs for update using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can delete time logs"
  on time_logs for delete using (is_shop_member(shop_id) or is_admin());

-- ============================================
-- 3. PRODUCT TYPE + CHANNEL COLUMNS
-- ============================================

alter table projects add column product_type_id uuid references product_types(id) on delete set null;
alter table templates add column product_type_id uuid references product_types(id) on delete set null;

-- Marketing channel for spend-by-channel ROI (used when category = 'marketing')
alter table expenses add column channel text;

-- ============================================
-- 4. PIPELINE STATUS MIGRATION
-- ============================================
-- Old: planning | in-progress | completed | on-hold
-- New: lead | quoted | deposit_paid | in_production | ready | delivered | closed
--      + on_hold as a separate boolean flag.

alter table projects add column on_hold boolean not null default false;

-- Drop the old check constraint so existing values can be rewritten.
alter table projects drop constraint if exists projects_status_check;

-- Map existing rows to the new pipeline stages.
update projects set on_hold = true where status = 'on-hold';
update projects set status = case status
  when 'planning' then 'lead'
  when 'in-progress' then 'in_production'
  when 'completed' then 'closed'
  when 'on-hold' then 'in_production'
  else 'lead'
end;

alter table projects alter column status set default 'lead';

alter table projects add constraint projects_status_check check (status in (
  'lead', 'quoted', 'deposit_paid', 'in_production', 'ready', 'delivered', 'closed'
));

-- ============================================
-- 5. REBUILD seed_shop_data (new status values + product types + time logs)
-- ============================================

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
  v_rent_rule_id uuid;
  v_this_month date := date_trunc('month', now())::date;
  v_pt_dining uuid;
  v_pt_coffee uuid;
  v_pt_shelf uuid;
  v_pt_custom uuid;
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

  -- Product types
  insert into product_types (id, shop_id, name, color, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Dining Table', '#a43700', auth.uid()) returning id into v_pt_dining;
  insert into product_types (id, shop_id, name, color, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Coffee Table', '#8f7066', auth.uid()) returning id into v_pt_coffee;
  insert into product_types (id, shop_id, name, color, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Shelf', '#4A7C6F', auth.uid()) returning id into v_pt_shelf;
  insert into product_types (id, shop_id, name, color, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Custom', '#6B7C5C', auth.uid()) returning id into v_pt_custom;

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

  -- Project 1: Walnut Dining Table (delivered/closed, fully paid)
  insert into projects (id, shop_id, name, type, product_type_id, description, date, status, buyer_name, labor_hours, hourly_rate, markup_factor, markup_applied_to, discount_percent,
      quoted_price, agreed_price, deposit_amount, deposit_paid_at, balance_paid_at, delivered_at, actual_hours, lead_source, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Walnut Dining Table', 'table', v_pt_dining, 'Custom walnut dining table for 6 people', '2026-02-15', 'closed', 'David Cohen', 24, 150, 1.3, 'materials+labor', 5,
      4500, 4500, 2250, '2026-01-20', '2026-02-15', '2026-02-15', 26, 'instagram', auth.uid())
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

  insert into time_logs (shop_id, project_id, created_by, date, hours, note) values
    (p_shop_id, v_project1_id, auth.uid(), '2026-02-03', 8, 'Milling and glue-up'),
    (p_shop_id, v_project1_id, auth.uid(), '2026-02-07', 10, 'Joinery'),
    (p_shop_id, v_project1_id, auth.uid(), '2026-02-12', 8, 'Sanding and finishing');

  -- Project 2: Floating Shelves Set (in production, deposit paid, on hold)
  insert into projects (id, shop_id, name, type, product_type_id, description, date, status, on_hold, labor_hours, hourly_rate, markup_factor, markup_applied_to, discount_percent,
      quoted_price, agreed_price, deposit_amount, deposit_paid_at, actual_hours, lead_source, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Floating Shelves Set', 'shelf', v_pt_shelf, 'Set of 4 floating oak shelves with hidden brackets', '2026-03-20', 'in_production', false, 8, 150, 1.2, 'materials', 0,
      1600, 1600, 800, '2026-03-05', 5, 'designer', auth.uid())
    returning id into v_project2_id;

  insert into project_materials (project_id, material_id, variant_id, quantity) values
    (v_project2_id, v_oak_id, null, 3),
    (v_project2_id, v_sandpaper_id, v_sand_120_var, 5),
    (v_project2_id, v_stain_id, null, 0.5);

  insert into wood_parts (project_id, name, length_mm, width_mm, quantity) values
    (v_project2_id, 'Shelf', 800, 300, 4),
    (v_project2_id, 'Bracket', 50, 300, 8);

  insert into time_logs (shop_id, project_id, created_by, date, hours, note) values
    (p_shop_id, v_project2_id, auth.uid(), '2026-03-10', 5, 'Rough cut oak');

  -- Template 1: Basic Shelf Unit
  insert into templates (id, shop_id, name, template_name, template_description, type, product_type_id, labor_hours, hourly_rate, markup_factor, markup_applied_to, discount_percent, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Basic Shelf Unit', 'Basic Shelf Unit', 'Simple shelf unit with 3 shelves and 2 side panels', 'shelf', v_pt_shelf, 6, 150, 1.25, 'materials+labor', 0, auth.uid())
    returning id into v_template1_id;

  insert into template_materials (template_id, material_id, variant_id, quantity) values
    (v_template1_id, v_pine_id, v_pine_2x4_var, 6),
    (v_template1_id, v_screws_id, v_screws_30_var, 40),
    (v_template1_id, v_sandpaper_id, v_sand_120_var, 3);

  insert into template_wood_parts (template_id, name, length_mm, width_mm, quantity) values
    (v_template1_id, 'Shelf', 600, 250, 3),
    (v_template1_id, 'Side Panel', 600, 300, 2);

  -- Shop settings
  insert into shop_settings (shop_id, monthly_profit_target, vat_exempt_ceiling, target_hourly_rate, weekly_hours_budget)
    values (p_shop_id, 3500, 122833, 150, 25);

  -- Recurring monthly workshop rent
  insert into recurring_expenses (id, shop_id, created_by, amount, category, supplier, description, day_of_month, active)
    values (uuid_generate_v4(), p_shop_id, auth.uid(), 1200, 'workshop_rent', 'Shared Workshop', 'Monthly bench rent', 1, true)
    returning id into v_rent_rule_id;

  -- Sample expenses (marketing rows carry a channel)
  insert into expenses (shop_id, created_by, date, amount, category, supplier, description, project_id, channel) values
    (p_shop_id, auth.uid(), '2026-02-01', 1200, 'workshop_rent', 'Shared Workshop', 'Monthly bench rent', null, null),
    (p_shop_id, auth.uid(), '2026-02-10', 320, 'materials', 'Hardwood Supplier', 'Walnut boards', v_project1_id, null),
    (p_shop_id, auth.uid(), '2026-02-18', 90, 'consumables', 'Local Hardware', 'Finish + sandpaper', null, null),
    (p_shop_id, auth.uid(), '2026-03-01', 1200, 'workshop_rent', 'Shared Workshop', 'Monthly bench rent', null, null),
    (p_shop_id, auth.uid(), '2026-03-08', 150, 'marketing', 'Instagram', 'Boosted post', null, 'instagram');

  insert into expenses (shop_id, created_by, date, amount, category, supplier, description, recurring_id, period_month)
    values (p_shop_id, auth.uid(), v_this_month, 1200, 'workshop_rent', 'Shared Workshop', 'Monthly bench rent', v_rent_rule_id, v_this_month)
    on conflict (recurring_id, period_month) do nothing;
end;
$$ language plpgsql security definer;
