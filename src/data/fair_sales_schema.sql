-- Table for tracking daily sales per entrepreneur in a fair
CREATE TABLE IF NOT EXISTS fair_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fair_id UUID REFERENCES fairs(id) ON DELETE CASCADE,
  entrepreneur_id UUID REFERENCES fair_entrepreneurs(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT
);

-- RLS
ALTER TABLE fair_sales ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Public Access Fair Sales" ON fair_sales FOR ALL USING (true) WITH CHECK (true);
