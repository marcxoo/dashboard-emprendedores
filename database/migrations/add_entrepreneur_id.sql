-- Add entrepreneur_id column to survey_responses table
ALTER TABLE survey_responses 
ADD COLUMN IF NOT EXISTS entrepreneur_id INTEGER REFERENCES entrepreneurs(id);

-- Enable RLS if not already enabled (optional, good practice)
-- ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- If you want to backfill data or check constraints, do it here.
-- For now, just adding the column is sufficient.
