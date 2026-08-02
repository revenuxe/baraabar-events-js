-- Add Salwar Kameez as a Women garment type — the Home hero promo card
-- links straight into Book > Women (see src/components/Hero.tsx) and
-- needs a matching card to land on.

INSERT INTO public.garment_types
  (category_id, slug, name, description, base_price_min, base_price_max, measurement_fields, sort_order)
VALUES
  ((SELECT id FROM public.categories WHERE slug='women'), 'salwar-kameez', 'Salwar Kameez', 'Classic salwar kameez, stitched to your fit', 699, 2999, ARRAY['chest','shoulder','sleeve','waist','hip','kurtaLength'], 6)
ON CONFLICT (slug) DO NOTHING;
