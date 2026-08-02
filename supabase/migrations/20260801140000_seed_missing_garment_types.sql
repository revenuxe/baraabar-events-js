-- Backfill garment_types so every category has the same options the booking
-- flow already shows today (Ethnic/Kids had none; Wedding/Office had fewer).
-- Prices are placeholder estimates mirrored from the closest existing row —
-- review/adjust them in Admin > Garments.

INSERT INTO public.garment_types
  (category_id, slug, name, description, base_price_min, base_price_max, measurement_fields, sort_order)
VALUES
  -- Ethnic
  ((SELECT id FROM public.categories WHERE slug='ethnic'), 'ethnic-kurta', 'Kurta', 'Everyday and festive kurtas', 1499, 3999, ARRAY['chest','shoulder','sleeve','waist','kurtaLength'], 1),
  ((SELECT id FROM public.categories WHERE slug='ethnic'), 'ethnic-sherwani', 'Sherwani', 'Festive sherwanis and bandhgalas', 4999, 12999, ARRAY['chest','shoulder','sleeve','waist','kurtaLength'], 2),
  ((SELECT id FROM public.categories WHERE slug='ethnic'), 'ethnic-lehenga', 'Lehenga', 'Flared, fitted or mermaid — your call', 4999, 14999, ARRAY['waist','hip','lehengaLength'], 3),
  ((SELECT id FROM public.categories WHERE slug='ethnic'), 'ethnic-blouse', 'Blouse', 'Custom-fit blouse stitched to your silhouette', 999, 2499, ARRAY['chest','shoulder','sleeve','blouseLength','neck'], 4),
  ((SELECT id FROM public.categories WHERE slug='ethnic'), 'ethnic-saree-fall', 'Saree Fall', 'Saree fall & pico', 299, 599, ARRAY['waist','hip'], 5),

  -- Kids
  ((SELECT id FROM public.categories WHERE slug='kids'), 'kids-shirt', 'Shirt', 'Formal & casual shirts for kids', 499, 1299, ARRAY['chest','shoulder','sleeve','waist','shirtLength','neck'], 1),
  ((SELECT id FROM public.categories WHERE slug='kids'), 'kids-kurta', 'Kurta', 'Festive and everyday kurtas for kids', 699, 1799, ARRAY['chest','shoulder','sleeve','waist','kurtaLength'], 2),
  ((SELECT id FROM public.categories WHERE slug='kids'), 'kids-dress', 'Dress', 'A-line and party dresses for kids', 799, 1999, ARRAY['chest','shoulder','sleeve','waist','hip','dressLength'], 3),
  ((SELECT id FROM public.categories WHERE slug='kids'), 'kids-other', 'Other', 'Anything else — tell us what you need', 499, 1499, ARRAY['chest','shoulder','waist','hip'], 4),

  -- Wedding (Sherwani, Bridal Lehenga already exist)
  ((SELECT id FROM public.categories WHERE slug='wedding'), 'wedding-suit', 'Suit', '2- or 3-piece suits', 7999, 19999, ARRAY['chest','shoulder','sleeve','waist','hip','inseam'], 3),
  ((SELECT id FROM public.categories WHERE slug='wedding'), 'wedding-blouse', 'Blouse', 'Custom-fit blouse stitched to your silhouette', 999, 2499, ARRAY['chest','shoulder','sleeve','blouseLength','neck'], 4),

  -- Office (Formal Shirt, Formal Trouser already exist)
  ((SELECT id FROM public.categories WHERE slug='office'), 'office-blazer', 'Blazer', 'Business & wedding blazers', 3999, 9999, ARRAY['chest','shoulder','sleeve','waist'], 3),
  ((SELECT id FROM public.categories WHERE slug='office'), 'office-suit', 'Suit', '2- or 3-piece suits', 7999, 19999, ARRAY['chest','shoulder','sleeve','waist','hip','inseam'], 4),
  ((SELECT id FROM public.categories WHERE slug='office'), 'office-dress', 'Dress', 'A-line, bodycon, gowns', 2499, 7999, ARRAY['chest','shoulder','sleeve','waist','hip','dressLength'], 5)
ON CONFLICT (slug) DO NOTHING;
