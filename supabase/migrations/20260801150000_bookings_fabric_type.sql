-- Customers bring their own fabric (this is a pickup-and-stitch service), but
-- the booking flow now asks what type it is so tailors know what they're
-- working with before pickup.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS fabric_type_id UUID REFERENCES public.fabric_types(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fabric_label TEXT;
