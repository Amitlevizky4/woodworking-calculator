-- ============================================
-- Migration 005: Dedupe categories & materials
-- ============================================
-- Some shops ended up with the seed data inserted multiple times (the
-- pre-multi-tenancy seed_user_data() ran concurrently on first login, and the
-- duplicates were carried into shops by migration 002). This dedupes
-- categories and materials per shop, remaps every reference to the surviving
-- row, and adds a unique constraint so duplicate category names can't come
-- back.

-- ============================================
-- 1. DEDUPE CATEGORIES (per shop, by name)
-- ============================================

create temp table cat_map as
select id as dupe_id,
       first_value(id) over (
         partition by shop_id, name
         order by created_at, id
       ) as keeper_id
from categories;

delete from cat_map where dupe_id = keeper_id;

update materials m
set category_id = cm.keeper_id
from cat_map cm
where m.category_id = cm.dupe_id;

delete from categories c
using cat_map cm
where c.id = cm.dupe_id;

-- ============================================
-- 2. DEDUPE MATERIALS (per shop, by name/category/unit/price)
-- ============================================

create temp table mat_map as
select id as dupe_id,
       first_value(id) over (
         partition by shop_id, name, category_id, unit, base_price
         order by created_at, id
       ) as keeper_id
from materials;

delete from mat_map where dupe_id = keeper_id;

-- Variants of a duplicate material that already exist on the keeper
-- (same label + price): remap references to the keeper's variant.
create temp table var_map as
select distinct on (dv.id)
       dv.id as dupe_var_id,
       kv.id as keeper_var_id
from mat_map mm
join material_variants dv on dv.material_id = mm.dupe_id
join material_variants kv on kv.material_id = mm.keeper_id
  and kv.label = dv.label
  and kv.price = dv.price
order by dv.id, kv.created_at, kv.id;

update project_materials pm
set variant_id = vm.keeper_var_id
from var_map vm
where pm.variant_id = vm.dupe_var_id;

update template_materials tm
set variant_id = vm.keeper_var_id
from var_map vm
where tm.variant_id = vm.dupe_var_id;

-- Variants of a duplicate material with no keeper equivalent: move them over.
update material_variants v
set material_id = mm.keeper_id
from mat_map mm
where v.material_id = mm.dupe_id
  and not exists (select 1 from var_map vm where vm.dupe_var_id = v.id);

-- Remap material references, then drop the duplicates (cascade removes the
-- already-remapped leftover variants).
update project_materials pm
set material_id = mm.keeper_id
from mat_map mm
where pm.material_id = mm.dupe_id;

update template_materials tm
set material_id = mm.keeper_id
from mat_map mm
where tm.material_id = mm.dupe_id;

delete from materials m
using mat_map mm
where m.id = mm.dupe_id;

drop table cat_map;
drop table mat_map;
drop table var_map;

-- ============================================
-- 3. PREVENT RECURRENCE
-- ============================================

create unique index if not exists uq_categories_shop_name
  on categories (shop_id, name);
