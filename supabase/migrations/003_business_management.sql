-- ============================================
-- Business Management (Phase 1): Expenses, Income Tracking, Settings
-- ============================================

-- ============================================
-- 1. NEW TABLES
-- ============================================

-- SHOP SETTINGS (one row per shop: configurable business targets)
create table shop_settings (
  shop_id uuid primary key references shops(id) on delete cascade,
  monthly_profit_target numeric(12, 2) not null default 3500,
  vat_exempt_ceiling numeric(12, 2) not null default 122833,
  target_hourly_rate numeric(8, 2) not null default 150,
  weekly_hours_budget numeric(6, 2) not null default 25,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table shop_settings enable row level security;

create trigger shop_settings_updated_at before update on shop_settings
  for each row execute function update_updated_at();

-- RECURRING EXPENSES (definitions; generated instances land in `expenses`)
create table recurring_expenses (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  created_by uuid references auth.users(id),
  amount numeric(12, 2) not null,
  category text not null check (category in (
    'workshop_rent', 'materials', 'consumables', 'tools',
    'insurance', 'marketing', 'transport', 'fees', 'other'
  )),
  supplier text,
  description text,
  day_of_month integer not null default 1 check (day_of_month between 1 and 28),
  active boolean not null default true,
  start_month date not null default date_trunc('month', now())::date,
  created_at timestamptz not null default now()
);

alter table recurring_expenses enable row level security;

create index idx_recurring_expenses_shop_id on recurring_expenses(shop_id);

-- EXPENSES
create table expenses (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  created_by uuid references auth.users(id),
  date date not null,
  amount numeric(12, 2) not null,
  category text not null check (category in (
    'workshop_rent', 'materials', 'consumables', 'tools',
    'insurance', 'marketing', 'transport', 'fees', 'other'
  )),
  supplier text,
  description text,
  project_id uuid references projects(id) on delete set null,
  receipt_url text,
  recurring_id uuid references recurring_expenses(id) on delete set null,
  period_month date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- prevent the same recurring rule from generating two rows for one month
  unique (recurring_id, period_month)
);

alter table expenses enable row level security;

create trigger expenses_updated_at before update on expenses
  for each row execute function update_updated_at();

create index idx_expenses_shop_id on expenses(shop_id);
create index idx_expenses_date on expenses(date);
create index idx_expenses_project_id on expenses(project_id);

-- ============================================
-- 2. EXTEND PROJECTS: income, payments, lead source, actual hours
-- ============================================

alter table projects add column quoted_price numeric(12, 2);
alter table projects add column agreed_price numeric(12, 2);
alter table projects add column deposit_amount numeric(12, 2);
alter table projects add column deposit_paid_at date;
alter table projects add column balance_paid_at date;
alter table projects add column delivered_at date;
alter table projects add column actual_hours numeric(8, 2);
alter table projects add column lead_source text check (lead_source in (
  'instagram', 'facebook_group', 'marketplace',
  'word_of_mouth', 'designer', 'friends_family', 'other'
));

-- ============================================
-- 3. RLS POLICIES (shop-member scoped, matching migration 002)
-- ============================================

-- === SHOP SETTINGS ===
create policy "Shop members can view shop settings"
  on shop_settings for select using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can insert shop settings"
  on shop_settings for insert with check (is_shop_member(shop_id) or is_admin());
create policy "Shop members can update shop settings"
  on shop_settings for update using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can delete shop settings"
  on shop_settings for delete using (is_shop_member(shop_id) or is_admin());

-- === RECURRING EXPENSES ===
create policy "Shop members can view recurring expenses"
  on recurring_expenses for select using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can insert recurring expenses"
  on recurring_expenses for insert with check (is_shop_member(shop_id) or is_admin());
create policy "Shop members can update recurring expenses"
  on recurring_expenses for update using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can delete recurring expenses"
  on recurring_expenses for delete using (is_shop_member(shop_id) or is_admin());

-- === EXPENSES ===
create policy "Shop members can view expenses"
  on expenses for select using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can insert expenses"
  on expenses for insert with check (is_shop_member(shop_id) or is_admin());
create policy "Shop members can update expenses"
  on expenses for update using (is_shop_member(shop_id) or is_admin());
create policy "Shop members can delete expenses"
  on expenses for delete using (is_shop_member(shop_id) or is_admin());

-- ============================================
-- 4. EXTEND seed_shop_data WITH BUSINESS DEMO DATA
-- ============================================
-- Rebuilds the RPC: same materials/projects/templates as migration 002, plus
-- default settings, a recurring rent rule, sample expenses, and income data on
-- the two demo projects.

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

  -- Project 1: Walnut Dining Table (completed, fully paid)
  insert into projects (id, shop_id, name, type, description, date, status, buyer_name, labor_hours, hourly_rate, markup_factor, markup_applied_to, discount_percent,
      quoted_price, agreed_price, deposit_amount, deposit_paid_at, balance_paid_at, delivered_at, actual_hours, lead_source, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Walnut Dining Table', 'table', 'Custom walnut dining table for 6 people', '2026-02-15', 'completed', 'David Cohen', 24, 150, 1.3, 'materials+labor', 5,
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

  -- Project 2: Floating Shelves Set (in-progress, deposit paid)
  insert into projects (id, shop_id, name, type, description, date, status, labor_hours, hourly_rate, markup_factor, markup_applied_to, discount_percent,
      quoted_price, agreed_price, deposit_amount, deposit_paid_at, actual_hours, lead_source, created_by) values
    (uuid_generate_v4(), p_shop_id, 'Floating Shelves Set', 'shelf', 'Set of 4 floating oak shelves with hidden brackets', '2026-03-20', 'in-progress', 8, 150, 1.2, 'materials', 0,
      1600, 1600, 800, '2026-03-05', 5, 'designer', auth.uid())
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

  -- Shop settings (defaults tuned for עוסק פטור 2026)
  insert into shop_settings (shop_id, monthly_profit_target, vat_exempt_ceiling, target_hourly_rate, weekly_hours_budget)
    values (p_shop_id, 3500, 122833, 150, 25);

  -- Recurring monthly workshop rent
  insert into recurring_expenses (id, shop_id, created_by, amount, category, supplier, description, day_of_month, active)
    values (uuid_generate_v4(), p_shop_id, auth.uid(), 1200, 'workshop_rent', 'Shared Workshop', 'Monthly bench rent', 1, true)
    returning id into v_rent_rule_id;

  -- Sample expenses
  insert into expenses (shop_id, created_by, date, amount, category, supplier, description, project_id) values
    (p_shop_id, auth.uid(), '2026-02-01', 1200, 'workshop_rent', 'Shared Workshop', 'Monthly bench rent', null),
    (p_shop_id, auth.uid(), '2026-02-10', 320, 'materials', 'Hardwood Supplier', 'Walnut boards', v_project1_id),
    (p_shop_id, auth.uid(), '2026-02-18', 90, 'consumables', 'Local Hardware', 'Finish + sandpaper', null),
    (p_shop_id, auth.uid(), '2026-03-01', 1200, 'workshop_rent', 'Shared Workshop', 'Monthly bench rent', null),
    (p_shop_id, auth.uid(), '2026-03-08', 150, 'marketing', 'Instagram', 'Boosted post', null);

  -- Mark the current month's rent as generated from the recurring rule so the
  -- confirm-prompt does not offer to create a duplicate.
  insert into expenses (shop_id, created_by, date, amount, category, supplier, description, recurring_id, period_month)
    values (p_shop_id, auth.uid(), v_this_month, 1200, 'workshop_rent', 'Shared Workshop', 'Monthly bench rent', v_rent_rule_id, v_this_month)
    on conflict (recurring_id, period_month) do nothing;
end;
$$ language plpgsql security definer;

-- ============================================
-- 5. BACKFILL shop_settings FOR EXISTING SHOPS
-- ============================================
-- seed_shop_data() early-returns for shops that already have data, so existing
-- shops need a default settings row inserted directly.

insert into shop_settings (shop_id)
select id from shops
on conflict (shop_id) do nothing;
