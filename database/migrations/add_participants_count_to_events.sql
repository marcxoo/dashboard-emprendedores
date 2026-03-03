ALTER TABLE public.events_2026
ADD COLUMN IF NOT EXISTS participants_count integer NOT NULL DEFAULT 0;

UPDATE public.events_2026
SET participants_count = 0
WHERE participants_count IS NULL;
