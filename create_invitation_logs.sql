-- Create the invitation_logs table
CREATE TABLE IF NOT EXISTS public.invitation_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    entrepreneur_id bigint REFERENCES public.entrepreneurs(id), -- Assuming entrepreneurs.id is int/bigint
    entrepreneur_name text, -- Store name snapshot just in case
    channel text CHECK (channel IN ('email', 'whatsapp', 'bulk_email')),
    template text,
    status text DEFAULT 'initiated'
);

-- Enable RLS
ALTER TABLE public.invitation_logs ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON TABLE public.invitation_logs TO authenticated;
GRANT ALL ON TABLE public.invitation_logs TO service_role;

-- Policies
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.invitation_logs;
CREATE POLICY "Enable all for authenticated users" ON public.invitation_logs
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
