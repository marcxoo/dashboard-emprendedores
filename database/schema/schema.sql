-- Run this query in your Supabase SQL Editor to create the events table

CREATE TABLE events_2026 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  month TEXT NOT NULL,
  type TEXT NOT NULL,
  name TEXT,
  scope TEXT, -- 'Interno' or 'Externo'
  guest TEXT, -- Added for external guests
  date DATE,
  "startTime" TIME,
  "endTime" TIME,
  location TEXT,
  responsibles TEXT[], -- Array of strings e.g. ['ANGIE HOLGUÍN', 'MARCOS LOJA']
  indicator TEXT,
  tracking JSONB DEFAULT '{}'::jsonb, -- Store checkboxes directly
  status TEXT DEFAULT 'active'
);

-- Enable Row Level Security (RLS) is recommended
ALTER TABLE events_2026 ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read/write (since this is a dashboard for internal team use)
-- OR you can set up authenticated policies. For now, we'll allow public access if you have anon key.
CREATE POLICY "Public Access" ON events_2026
FOR ALL
USING (true)
WITH CHECK (true);
