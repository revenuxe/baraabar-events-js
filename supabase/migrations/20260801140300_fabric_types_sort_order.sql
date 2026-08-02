-- Fabrics didn't have a sort_order column, needed so admin can reposition cards
-- the same way Categories/Garments/Style Presets already can.
ALTER TABLE public.fabric_types ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;
