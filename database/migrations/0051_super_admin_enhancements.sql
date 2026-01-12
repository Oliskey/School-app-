-- ============================================================================
-- Super Admin Dashboard Enhancements - Database Migration (SAFE VERSION)
-- Version: 0051
-- Run this in parts if needed, or all at once
-- ============================================================================

-- ============================================================================
-- PART 1: DROP EXISTING TABLES (if you want a clean slate)
-- Comment out this section if you want to keep existing data
-- ============================================================================
/*
DROP TABLE IF EXISTS public.usage_analytics CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.platform_notifications CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
*/

-- ============================================================================
-- PART 2: CREATE TABLES
-- ============================================================================

-- 1. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES public.plans(id),
    status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('active', 'past_due', 'canceled', 'trial')),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    trial_ends_at TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT true,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT CHECK (payment_method IN ('flutterwave', 'paystack', 'bank_transfer', 'cash')),
    transaction_reference TEXT UNIQUE,
    gateway_response JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 3. INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'canceled')),
    pdf_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PLATFORM NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.platform_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('announcement', 'alert', 'maintenance', 'update')),
    target_schools UUID[],
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sent_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AUDIT LOGS (This is the problematic one - drop and recreate)
DROP TABLE IF EXISTS public.audit_logs CASCADE;
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. USAGE ANALYTICS
CREATE TABLE IF NOT EXISTS public.usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    active_users INTEGER DEFAULT 0,
    total_logins INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    features_used JSONB DEFAULT '{}'::jsonb,
    storage_used_gb NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, date)
);

-- 7. ROLE PERMISSIONS (Drop and recreate to fix schema)
DROP TABLE IF EXISTS public.role_permissions CASCADE;
CREATE TABLE public.role_permissions (
    id SERIAL PRIMARY KEY,
    role_name TEXT NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete', 'manage')),
    allowed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_name, resource, action)
);

-- ============================================================================
-- PART 3: CREATE INDEXES
-- ============================================================================

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_school_id ON public.subscriptions(school_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_school_id ON public.payments(school_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_ref ON public.payments(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_school_id ON public.invoices(school_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- Platform notifications indexes
CREATE INDEX IF NOT EXISTS idx_platform_notifications_type ON public.platform_notifications(type);
CREATE INDEX IF NOT EXISTS idx_platform_notifications_sent_at ON public.platform_notifications(sent_at);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Usage analytics indexes
CREATE INDEX IF NOT EXISTS idx_usage_analytics_school_date ON public.usage_analytics(school_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_date ON public.usage_analytics(date DESC);

-- Role permissions indexes
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_name);

-- ============================================================================
-- PART 4: UPDATE EXISTING TABLES
-- ============================================================================

ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS max_teachers INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_storage_gb INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS features_list TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS total_users INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS storage_used_gb NUMERIC(10, 2) DEFAULT 0;

-- ============================================================================
-- PART 5: ENABLE RLS
-- ============================================================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 6: CREATE RLS POLICIES
-- ============================================================================

-- Drop all existing policies first
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Super admin view all subscriptions" ON public.subscriptions;
    DROP POLICY IF EXISTS "School admin view own subscriptions" ON public.subscriptions;
    DROP POLICY IF EXISTS "Super admin manage subscriptions" ON public.subscriptions;
    DROP POLICY IF EXISTS "Super admin view all payments" ON public.payments;
    DROP POLICY IF EXISTS "School admin view own payments" ON public.payments;
    DROP POLICY IF EXISTS "Super admin manage payments" ON public.payments;
    DROP POLICY IF EXISTS "Super admin view all invoices" ON public.invoices;
    DROP POLICY IF EXISTS "School view own invoices" ON public.invoices;
    DROP POLICY IF EXISTS "Super admin manage invoices" ON public.invoices;
    DROP POLICY IF EXISTS "All users read platform notifications" ON public.platform_notifications;
    DROP POLICY IF EXISTS "Super admin manage notifications" ON public.platform_notifications;
    DROP POLICY IF EXISTS "Super admin view audit logs" ON public.audit_logs;
    DROP POLICY IF EXISTS "System insert audit logs" ON public.audit_logs;
    DROP POLICY IF EXISTS "Super admin view all analytics" ON public.usage_analytics;
    DROP POLICY IF EXISTS "School view own analytics" ON public.usage_analytics;
    DROP POLICY IF EXISTS "Super admin manage analytics" ON public.usage_analytics;
    DROP POLICY IF EXISTS "All users read role permissions" ON public.role_permissions;
    DROP POLICY IF EXISTS "Super admin manage role permissions" ON public.role_permissions;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Subscriptions policies
CREATE POLICY "Super admin view all subscriptions" ON public.subscriptions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()));

CREATE POLICY "School admin view own subscriptions" ON public.subscriptions FOR SELECT
USING (school_id IN (SELECT school_id FROM public.users WHERE id::text = auth.uid()::text));

CREATE POLICY "Super admin manage subscriptions" ON public.subscriptions FOR ALL
USING (EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()));

-- Payments policies
CREATE POLICY "Super admin view all payments" ON public.payments FOR SELECT
USING (EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()));

CREATE POLICY "School admin view own payments" ON public.payments FOR SELECT
USING (school_id IN (SELECT school_id FROM public.users WHERE id::text = auth.uid()::text));

CREATE POLICY "Super admin manage payments" ON public.payments FOR ALL
USING (EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()));

-- Invoices policies
CREATE POLICY "Super admin view all invoices" ON public.invoices FOR SELECT
USING (EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()));

CREATE POLICY "School view own invoices" ON public.invoices FOR SELECT
USING (school_id IN (SELECT school_id FROM public.users WHERE id::text = auth.uid()::text));

CREATE POLICY "Super admin manage invoices" ON public.invoices FOR ALL
USING (EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()));

-- Platform notifications policies
CREATE POLICY "All users read platform notifications" ON public.platform_notifications FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admin manage notifications" ON public.platform_notifications FOR ALL
USING (EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()));

-- Audit logs policies
CREATE POLICY "Super admin view audit logs" ON public.audit_logs FOR SELECT
USING (EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()));

CREATE POLICY "System insert audit logs" ON public.audit_logs FOR INSERT
WITH CHECK (true);

-- Usage analytics policies
CREATE POLICY "Super admin view all analytics" ON public.usage_analytics FOR SELECT
USING (EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()));

CREATE POLICY "School view own analytics" ON public.usage_analytics FOR SELECT
USING (school_id IN (SELECT school_id FROM public.users WHERE id::text = auth.uid()::text));

CREATE POLICY "Super admin manage analytics" ON public.usage_analytics FOR ALL
USING (EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()));

-- Role permissions policies
CREATE POLICY "All users read role permissions" ON public.role_permissions FOR SELECT
USING (true);

CREATE POLICY "Super admin manage role permissions" ON public.role_permissions FOR ALL
USING (EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()));

-- ============================================================================
-- PART 7: SEED DATA
-- ============================================================================

-- Update plans
UPDATE public.plans SET 
    description = 'Perfect for small schools getting started',
    max_teachers = 5,
    max_storage_gb = 1,
    features_list = ARRAY['Attendance', 'Basic Grading', 'Parent Portal'],
    display_order = 1
WHERE name = 'Free';

UPDATE public.plans SET 
    description = 'Great for growing schools',
    max_teachers = 20,
    max_storage_gb = 10,
    features_list = ARRAY['Attendance', 'Grading', 'Parent Portal', 'Timetable', 'Messaging'],
    display_order = 2
WHERE name = 'Basic';

UPDATE public.plans SET 
    description = 'Complete solution for large institutions',
    max_teachers = 100,
    max_storage_gb = 100,
    features_list = ARRAY['All Features', 'Analytics', 'API Access', 'Priority Support'],
    display_order = 3
WHERE name = 'Pro';

-- Seed role permissions
INSERT INTO public.role_permissions (role_name, resource, action, allowed) VALUES
('Super Admin', 'schools', 'manage', true),
('Super Admin', 'plans', 'manage', true),
('Super Admin', 'subscriptions', 'manage', true),
('Super Admin', 'payments', 'manage', true),
('Super Admin', 'analytics', 'read', true),
('Admin', 'students', 'manage', true),
('Admin', 'teachers', 'manage', true),
('Admin', 'classes', 'manage', true),
('Admin', 'attendance', 'manage', true),
('Admin', 'grades', 'manage', true),
('Admin', 'fees', 'manage', true),
('Teacher', 'students', 'read', true),
('Teacher', 'attendance', 'create', true),
('Teacher', 'grades', 'create', true),
('Teacher', 'assignments', 'manage', true),
('Parent', 'students', 'read', true),
('Parent', 'attendance', 'read', true),
('Parent', 'grades', 'read', true),
('Parent', 'fees', 'read', true),
('Student', 'profile', 'read', true),
('Student', 'attendance', 'read', true),
('Student', 'grades', 'read', true),
('Student', 'assignments', 'read', true)
ON CONFLICT (role_name, resource, action) DO NOTHING;

-- ============================================================================
-- PART 8: FUNCTIONS & TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_num
    FROM public.invoices
    WHERE invoice_number LIKE 'INV-%';
    
    RETURN 'INV-' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATION COMPLETE ✅
-- ============================================================================
