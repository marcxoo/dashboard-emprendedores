-- 1. Update policies to allow anonymous access (since the app uses Mock Auth)

-- Entrepreneurs
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.entrepreneurs;
CREATE POLICY "Enable all for public usage" ON public.entrepreneurs
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Assignments
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.assignments;
CREATE POLICY "Enable all for public usage" ON public.assignments
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Earnings
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.earnings;
CREATE POLICY "Enable all for public usage" ON public.earnings
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Custom Surveys
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.custom_surveys;
CREATE POLICY "Enable all for public usage" ON public.custom_surveys
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Survey Responses
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.survey_responses;
CREATE POLICY "Enable all for public usage" ON public.survey_responses
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 2. Ensure anon role has permissions
GRANT ALL ON TABLE public.entrepreneurs TO anon;
GRANT ALL ON TABLE public.assignments TO anon;
GRANT ALL ON TABLE public.earnings TO anon;
GRANT ALL ON TABLE public.custom_surveys TO anon;
GRANT ALL ON TABLE public.survey_responses TO anon;
