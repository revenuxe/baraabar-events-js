-- booking_status_events existed since the initial schema but nothing ever
-- wrote to it, so order status history was tracked nowhere. A trigger (not
-- an app-level insert) is the robust fix: it fires no matter which code
-- path changes a booking's status — admin dashboard, customer cancel
-- button, or anything added later — so the timeline can't silently fall
-- out of sync with reality the way the app-level insert sites could.
CREATE OR REPLACE FUNCTION public.log_booking_status_event()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO public.booking_status_events (booking_id, status)
    VALUES (NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS booking_status_event_trigger ON public.bookings;
CREATE TRIGGER booking_status_event_trigger
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.log_booking_status_event();

-- Backfill: give every existing booking at least one event row (its current
-- status) so the timeline isn't empty for orders placed before this trigger.
INSERT INTO public.booking_status_events (booking_id, status, created_at)
SELECT b.id, b.status, b.created_at
FROM public.bookings b
WHERE NOT EXISTS (
  SELECT 1 FROM public.booking_status_events e WHERE e.booking_id = b.id
);
