-- Reference images are now captured per garment (booking_items) instead of
-- once for the whole order, since a booking can contain multiple garments
-- each with their own look.
ALTER TABLE public.booking_items
  ADD COLUMN IF NOT EXISTS reference_images TEXT[] NOT NULL DEFAULT '{}';
