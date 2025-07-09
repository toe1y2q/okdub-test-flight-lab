
-- Create OKDUB utility token table
CREATE TABLE public.okdub_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token_amount DECIMAL(18,8) DEFAULT 0,
  staked_amount DECIMAL(18,8) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create projects table for QA testing
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL, -- 'smart_contract', 'dapp', 'defi', etc.
  client_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contract_address TEXT,
  network TEXT DEFAULT 'sepolia',
  budget DECIMAL(10,2),
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bug bounties table
CREATE TABLE public.bug_bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  reward_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'open', -- 'open', 'claimed', 'closed'
  submitted_by UUID REFERENCES auth.users(id),
  claimed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscription tiers table
CREATE TABLE public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  required_tokens DECIMAL(18,8) NOT NULL,
  features JSONB NOT NULL, -- Store features as JSON
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (name, required_tokens, features) VALUES
('Free', 0, '{"max_tests_per_day": 5, "sandbox_access": false, "priority_support": false}'),
('Bronze', 100, '{"max_tests_per_day": 20, "sandbox_access": true, "priority_support": false}'),
('Silver', 500, '{"max_tests_per_day": 50, "sandbox_access": true, "priority_support": true, "private_rpc": false}'),
('Gold', 1000, '{"max_tests_per_day": 100, "sandbox_access": true, "priority_support": true, "private_rpc": true}');

-- Update NFT mints to support marketplace
ALTER TABLE public.nft_mints 
ADD COLUMN IF NOT EXISTS current_owner_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS original_creator_id UUID REFERENCES auth.users(id);

-- Set existing NFTs owner and creator
UPDATE public.nft_mints 
SET current_owner_id = user_id, original_creator_id = user_id 
WHERE current_owner_id IS NULL;

-- Create NFT sales table
CREATE TABLE public.nft_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id UUID REFERENCES public.nft_mints(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  buyer_id UUID REFERENCES auth.users(id),
  price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'listed', -- 'listed', 'sold', 'cancelled'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sold_at TIMESTAMPTZ
);

-- Enable RLS on new tables
ALTER TABLE public.okdub_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_sales ENABLE ROW LEVEL SECURITY;

-- RLS policies for okdub_tokens
CREATE POLICY "Users can view own tokens" ON public.okdub_tokens
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens" ON public.okdub_tokens
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens" ON public.okdub_tokens
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for projects
CREATE POLICY "Anyone can view active projects" ON public.projects
FOR SELECT USING (status = 'active');

CREATE POLICY "Project owners can manage their projects" ON public.projects
FOR ALL USING (auth.uid() = client_user_id);

-- RLS policies for bug_bounties
CREATE POLICY "Anyone can view open bounties" ON public.bug_bounties
FOR SELECT USING (status = 'open' OR submitted_by = auth.uid() OR claimed_by = auth.uid());

CREATE POLICY "Users can submit bounties" ON public.bug_bounties
FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can update their submitted bounties" ON public.bug_bounties
FOR UPDATE USING (auth.uid() = submitted_by OR auth.uid() = claimed_by);

-- RLS policies for subscription_tiers
CREATE POLICY "Anyone can view subscription tiers" ON public.subscription_tiers
FOR SELECT USING (true);

-- RLS policies for nft_sales
CREATE POLICY "Anyone can view active NFT listings" ON public.nft_sales
FOR SELECT USING (status = 'listed' OR seller_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "NFT owners can create sales" ON public.nft_sales
FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers and buyers can update sales" ON public.nft_sales
FOR UPDATE USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- Initialize OKDUB tokens for existing users
INSERT INTO public.okdub_tokens (user_id, token_amount)
SELECT id, 50 FROM auth.users
ON CONFLICT DO NOTHING;
