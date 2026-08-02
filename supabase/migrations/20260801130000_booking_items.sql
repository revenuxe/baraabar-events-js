-- One row per garment within a booking, so a single order can contain
-- multiple garment types (e.g. 2 Shirts + 1 Trouser) each with its own
-- quantity, style and measurements.
CREATE TABLE public.booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  category_slug TEXT,
  garment_label TEXT NOT NULL,
  style_label TEXT,
  quantity INT NOT NULL DEFAULT 1,
  measurement_snapshot JSONB,
  estimated_price_min INT,
  estimated_price_max INT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_items TO authenticated;
GRANT ALL ON public.booking_items TO service_role;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage booking items" ON public.booking_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

CREATE INDEX idx_booking_items_booking ON public.booking_items(booking_id, sort_order);
