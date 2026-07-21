-- ============================================
-- Migration 006: Base price label on materials
-- ============================================
-- Materials with variants show each variant with a label, but the base price
-- had no name. This adds an optional label (e.g. "Standard") displayed next
-- to the base price wherever variants are picked.

alter table materials add column if not exists base_price_label text;
