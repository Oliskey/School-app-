-- Ensure columns exist in conversations table
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS last_message_text TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'direct';
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure columns exist in messages table (just in case)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text';

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload config';
