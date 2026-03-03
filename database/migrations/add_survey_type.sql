-- Add type column to custom_surveys if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'custom_surveys' AND column_name = 'survey_type') THEN
        ALTER TABLE custom_surveys ADD COLUMN survey_type text DEFAULT 'standard';
    END IF;
END $$;
