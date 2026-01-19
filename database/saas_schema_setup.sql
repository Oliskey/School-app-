-- Enable UUID extension if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables to ensure fresh schema (Fixes missing column errors)
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS schools CASCADE; 
-- Dropping schools to ensure we have the 'email' column and correct schema.


-- PLANS Table (Static data)
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    features TEXT[], -- Array of strings
    max_students INTEGER,
    max_teachers INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SCHOOLS Table
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    logo_url TEXT,
    address TEXT,
    phone TEXT,
    website TEXT,
    subscription_status TEXT DEFAULT 'trial', -- active, inactive, past_due, trial
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUBSCRIPTIONS Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES plans(id),
    status TEXT DEFAULT 'trial',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT TRUE,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Plans
INSERT INTO plans (name, price, currency, features, max_students, max_teachers) VALUES 
('Basic', 15000, 'NGN', ARRAY['Student Records', 'Attendance', 'Report Cards', 'Max 200 Students'], 200, 10),
('Standard', 35000, 'NGN', ARRAY['All Basic', 'Computer Based Testing', 'Finance', 'Max 1000 Students'], 1000, 50),
('Premium', 75000, 'NGN', ARRAY['All Standard', 'AI Features', 'Mobile App', 'Unlimited Students'], 100000, 1000)
ON CONFLICT DO NOTHING;

-- RLS POLICIES
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Allow public read of plans
CREATE POLICY "Public read plans" ON plans FOR SELECT USING (true);

-- Allow public insert for schools (Required for Signup Flow)
DROP POLICY IF EXISTS "Enable insert for registration" ON schools;
CREATE POLICY "Enable insert for registration" ON schools FOR INSERT WITH CHECK (true);

-- Allow public read/update for schools (Simplification for MVP, refine for Prod)
DROP POLICY IF EXISTS "Enable read for all" ON schools;
CREATE POLICY "Enable read for all" ON schools FOR SELECT USING (true);

-- Subscriptions RLS
DROP POLICY IF EXISTS "Enable insert for registration" ON subscriptions;
CREATE POLICY "Enable insert for registration" ON subscriptions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read for all" ON subscriptions;
CREATE POLICY "Enable read for all" ON subscriptions FOR SELECT USING (true);
