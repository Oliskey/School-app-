-- Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- e.g., 'Free', 'Basic', 'Pro'
    price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0,
    price_yearly NUMERIC(10, 2) NOT NULL DEFAULT 0,
    features JSONB DEFAULT '{}'::jsonb, -- e.g., {"students": 100, "storage_gb": 1}
    limits JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial plans
INSERT INTO public.plans (name, price_monthly, price_yearly, features, limits)
VALUES 
('Free', 0, 0, '{"max_students": 50, "modules": ["attendance", "basic_grading"]}'::jsonb, '{"storage_gb": 0.5}'::jsonb),
('Basic', 29.99, 299.99, '{"max_students": 200, "modules": ["attendance", "grading", "parents"]}'::jsonb, '{"storage_gb": 5}'::jsonb),
('Pro', 99.99, 999.99, '{"max_students": 1000, "modules": ["all"]}'::jsonb, '{"storage_gb": 50}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Update schools table for SaaS status
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
ADD COLUMN IF NOT EXISTS plan_id INTEGER REFERENCES public.plans(id),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trial')),
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ;

-- Create super_admins table (mapping to auth.users)
CREATE TABLE IF NOT EXISTS public.super_admins (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- RLS Policies

-- Enable RLS on new tables
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Plans: Public read, Super Admin write
CREATE POLICY "Public read plans" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Super admin manage plans" ON public.plans FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid())
);

-- Schools: Super Admin sees all, School Admin sees own
-- Note: Existing policies might restrict 'schools', we add a permissive one for Super Admin
CREATE POLICY "Super admin view all schools" ON public.schools FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Super admin update all schools" ON public.schools FOR UPDATE
USING (
    EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid())
);

-- Super Admins: Only readable by themselves (or public if we want to check 'am I super admin?')
-- Actually, key is: can I check if *I* am a super admin? Yes.
CREATE POLICY "Read own super admin status" ON public.super_admins FOR SELECT
USING (auth.uid() = user_id);

-- Insert a default Super Admin (for development, assumes current user or a specific one)
-- Ideally this is done via a dedicated script or checking the first user. 
-- For now, we leave the table empty. User must manually insert themselves or run a script.
