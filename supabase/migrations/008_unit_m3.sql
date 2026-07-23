-- ============================================
-- Migration 008: Cubic meter unit
-- ============================================
-- Adds m3 (קוב) to the allowed material units.

alter table materials drop constraint if exists materials_unit_check;
alter table materials
  add constraint materials_unit_check
  check (unit in ('meter', 'sheet', 'liter', 'piece', 'kg', 'm2', 'm3'));
