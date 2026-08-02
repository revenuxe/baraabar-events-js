ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS category_slug text,
  ADD COLUMN IF NOT EXISTS garment_label text,
  ADD COLUMN IF NOT EXISTS style_label text,
  ADD COLUMN IF NOT EXISTS reference_images text[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.booking_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Untitled draft',
  category_slug text,
  garment_label text,
  step integer NOT NULL DEFAULT 0,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_drafts TO authenticated;
GRANT ALL ON public.booking_drafts TO service_role;

ALTER TABLE public.booking_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own drafts" ON public.booking_drafts;
CREATE POLICY "Users manage their own drafts"
ON public.booking_drafts FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_booking_drafts_updated_at ON public.booking_drafts;
CREATE TRIGGER set_booking_drafts_updated_at
BEFORE UPDATE ON public.booking_drafts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS booking_drafts_user_idx ON public.booking_drafts (user_id, updated_at DESC);