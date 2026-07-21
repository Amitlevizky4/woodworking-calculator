-- ============================================
-- Migration 007: Grain direction on wood parts
-- ============================================
-- Each cut-list part can declare which of its dimensions runs along the
-- sheet's grain (the long axis). The cut optimizer keeps that orientation,
-- rotating only when the part cannot fit a sheet otherwise.

alter table wood_parts
  add column if not exists grain_direction text not null default 'length'
  check (grain_direction in ('length', 'width'));

alter table template_wood_parts
  add column if not exists grain_direction text not null default 'length'
  check (grain_direction in ('length', 'width'));
