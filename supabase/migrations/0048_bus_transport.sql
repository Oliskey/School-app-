
-- Create transport_buses table
CREATE TABLE IF NOT EXISTS public.transport_buses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    route_name TEXT NOT NULL,
    capacity INTEGER DEFAULT 30,
    plate_number TEXT NOT NULL,
    driver_name TEXT,
    status TEXT CHECK (status IN ('active', 'inactive', 'maintenance')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transport_buses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for authenticated users" ON public.transport_buses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON public.transport_buses
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON public.transport_buses TO authenticated;
GRANT ALL ON public.transport_buses TO service_role;
