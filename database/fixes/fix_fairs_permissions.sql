-- 1. Grant permissions to the authenticated role for all fair-related tables
GRANT ALL ON TABLE public.fairs TO authenticated;
GRANT ALL ON TABLE public.fair_entrepreneurs TO authenticated;
GRANT ALL ON TABLE public.fair_assignments TO authenticated;
GRANT ALL ON TABLE public.fair_sales TO authenticated;

-- 2. Ensure they are also granted to the anon role (for public views if any)
GRANT ALL ON TABLE public.fairs TO anon;
GRANT ALL ON TABLE public.fair_entrepreneurs TO anon;
GRANT ALL ON TABLE public.fair_assignments TO anon;
GRANT ALL ON TABLE public.fair_sales TO anon;

-- 3. Confirm RLS is enabled and permissive (already in fairs_schema.sql but good to double check)
ALTER TABLE public.fairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fair_entrepreneurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fair_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fair_sales ENABLE ROW LEVEL SECURITY;

-- 4. Re-apply policies to be safe
DROP POLICY IF EXISTS "Public Access Fairs" ON public.fairs;
CREATE POLICY "Public Access Fairs" ON public.fairs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access Fair Ent" ON public.fair_entrepreneurs;
CREATE POLICY "Public Access Fair Ent" ON public.fair_entrepreneurs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access Fair Assign" ON public.fair_assignments;
CREATE POLICY "Public Access Fair Assign" ON public.fair_assignments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access Fair Sales" ON public.fair_sales;
CREATE POLICY "Public Access Fair Sales" ON public.fair_sales FOR ALL USING (true) WITH CHECK (true);
