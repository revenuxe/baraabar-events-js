-- fabric_types.sort_order was added with DEFAULT 0, so every existing row
-- (Cotton, Silk, Linen, ...) tied at 0. With no secondary sort key, ORDER BY
-- sort_order alone let Postgres return ties in an unstable order, which is
-- why the admin's up/down reordering looked like it was "moving randomly."
-- Backfill distinct, stable values based on current creation order.
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
  FROM public.fabric_types
)
UPDATE public.fabric_types ft
SET sort_order = ordered.rn
FROM ordered
WHERE ft.id = ordered.id;
