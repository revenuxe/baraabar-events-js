-- Fabrics didn't have an image column; admin can now upload a swatch/photo per fabric.
ALTER TABLE public.fabric_types ADD COLUMN IF NOT EXISTS image_url TEXT;
