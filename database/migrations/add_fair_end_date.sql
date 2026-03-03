-- Add end_date column to fairs table
ALTER TABLE fairs ADD COLUMN IF NOT EXISTS end_date DATE;

-- Update existing fair to have end_date (Feria Innovatech: Jan 23-25, 2026)
-- Assuming date = '2026-01-23', set end_date = '2026-01-25'
UPDATE fairs SET end_date = date + INTERVAL '2 days' WHERE end_date IS NULL AND date IS NOT NULL;
