-- 1. Grant permissions to the authenticated role (allows logged-in users to access)
GRANT ALL ON TABLE public.entrepreneurs TO authenticated;
GRANT ALL ON TABLE public.assignments TO authenticated;
GRANT ALL ON TABLE public.earnings TO authenticated;
GRANT ALL ON TABLE public.custom_surveys TO authenticated;
GRANT ALL ON TABLE public.survey_responses TO authenticated;

-- 2. Grant usage to public schema just in case
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- 3. Enable Row Level Security (RLS) on the tables
ALTER TABLE public.entrepreneurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- 4. Create permissive policies for authenticated users
-- Entrepreneurs
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.entrepreneurs;
CREATE POLICY "Enable all for authenticated users" ON public.entrepreneurs
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Assignments
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.assignments;
CREATE POLICY "Enable all for authenticated users" ON public.assignments
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Earnings
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.earnings;
CREATE POLICY "Enable all for authenticated users" ON public.earnings
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Custom Surveys
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.custom_surveys;
CREATE POLICY "Enable all for authenticated users" ON public.custom_surveys
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Survey Responses
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.survey_responses;
CREATE POLICY "Enable all for authenticated users" ON public.survey_responses
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Ensure 'ruc' column exists in entrepreneurs table (Code attempts to write to it)
ALTER TABLE public.entrepreneurs ADD COLUMN IF NOT EXISTS ruc text;
