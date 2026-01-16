-- Create table for Fairs
CREATE TABLE IF NOT EXISTS fairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  date DATE,
  location TEXT,
  description TEXT,
  status TEXT DEFAULT 'active' -- 'active', 'archived', 'completed'
);

-- Create table for Entrepreneurs specific to Fairs
CREATE TABLE IF NOT EXISTS fair_entrepreneurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL, -- Owner name
  business_name TEXT, -- Entrepreneurship name
  category TEXT,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'active'
);

-- Create table for Assignments (connecting Fairs and Entrepreneurs)
CREATE TABLE IF NOT EXISTS fair_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fair_id UUID REFERENCES fairs(id) ON DELETE CASCADE,
  entrepreneur_id UUID REFERENCES fair_entrepreneurs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'assigned', -- 'assigned', 'confirmed', 'attended', 'cancelled'
  notes TEXT,
  UNIQUE(fair_id, entrepreneur_id)
);

-- Enable RLS
ALTER TABLE fairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fair_entrepreneurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fair_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies (Public access for now, similar to existing setup)
CREATE POLICY "Public Access Fairs" ON fairs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Fair Ent" ON fair_entrepreneurs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Fair Assign" ON fair_assignments FOR ALL USING (true) WITH CHECK (true);
