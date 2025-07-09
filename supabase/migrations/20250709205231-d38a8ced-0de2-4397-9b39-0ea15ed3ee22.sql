
-- Add Solana payment support
ALTER TABLE public.payments 
ADD COLUMN solana_transaction_id TEXT,
ADD COLUMN solana_wallet_address TEXT;

-- Create user subscription tracking
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'pro'
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on user subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user subscriptions
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.user_subscriptions
FOR UPDATE USING (auth.uid() = user_id);

-- Create bounty completion tracking
CREATE TABLE public.bounty_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id UUID REFERENCES public.bug_bounties(id) ON DELETE CASCADE NOT NULL,
  completed_by UUID REFERENCES auth.users(id) NOT NULL,
  completion_proof TEXT NOT NULL, -- Description of how the bug was fixed
  completion_url TEXT, -- Link to fix (PR, etc.)
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on bounty completions
ALTER TABLE public.bounty_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for bounty completions
CREATE POLICY "Users can view bounty completions" ON public.bounty_completions
FOR SELECT USING (
  completed_by = auth.uid() OR 
  auth.uid() IN (
    SELECT bb.submitted_by 
    FROM public.bug_bounties bb 
    WHERE bb.id = bounty_id
  )
);

CREATE POLICY "Users can submit bounty completions" ON public.bounty_completions
FOR INSERT WITH CHECK (auth.uid() = completed_by);

CREATE POLICY "Bounty creators can update completions" ON public.bounty_completions
FOR UPDATE USING (
  auth.uid() IN (
    SELECT bb.submitted_by 
    FROM public.bug_bounties bb 
    WHERE bb.id = bounty_id
  )
);

-- Update bug bounties RLS to prevent creators from claiming their own bounties
DROP POLICY IF EXISTS "Users can update their submitted bounties" ON public.bug_bounties;

CREATE POLICY "Users can update bounties they submitted" ON public.bug_bounties
FOR UPDATE USING (auth.uid() = submitted_by);

CREATE POLICY "Users can claim other bounties" ON public.bug_bounties
FOR UPDATE USING (auth.uid() = claimed_by AND auth.uid() != submitted_by);

-- Update projects RLS to only allow Pro users to create projects
DROP POLICY IF EXISTS "Project owners can manage their projects" ON public.projects;

CREATE POLICY "Pro users can create projects" ON public.projects
FOR INSERT WITH CHECK (
  auth.uid() = client_user_id AND
  auth.uid() IN (
    SELECT user_id FROM public.user_subscriptions 
    WHERE subscription_tier = 'pro' AND is_active = true
  )
);

CREATE POLICY "Project owners can manage their projects" ON public.projects
FOR ALL USING (auth.uid() = client_user_id);

-- Update bug bounties to only allow Pro users to create bounties
DROP POLICY IF EXISTS "Users can submit bounties" ON public.bug_bounties;

CREATE POLICY "Pro users can submit bounties" ON public.bug_bounties
FOR INSERT WITH CHECK (
  auth.uid() = submitted_by AND
  auth.uid() IN (
    SELECT user_id FROM public.user_subscriptions 
    WHERE subscription_tier = 'pro' AND is_active = true
  )
);

-- Initialize free subscriptions for existing users
INSERT INTO public.user_subscriptions (user_id, subscription_tier)
SELECT id, 'free' FROM auth.users
ON CONFLICT DO NOTHING;
