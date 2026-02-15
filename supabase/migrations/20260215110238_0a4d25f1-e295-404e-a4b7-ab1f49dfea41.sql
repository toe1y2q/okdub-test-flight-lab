
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  wallet_address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Leaderboard stats
CREATE TABLE public.leaderboard_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_tests INT NOT NULL DEFAULT 0,
  total_nfts INT NOT NULL DEFAULT 0,
  success_rate NUMERIC NOT NULL DEFAULT 100,
  points INT NOT NULL DEFAULT 0,
  weekly_points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.leaderboard_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all leaderboard" ON public.leaderboard_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own stats" ON public.leaderboard_stats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.leaderboard_stats FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- User balances
CREATE TABLE public.user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  points_balance NUMERIC NOT NULL DEFAULT 0,
  cash_balance NUMERIC NOT NULL DEFAULT 0,
  total_earned NUMERIC NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own balance" ON public.user_balances FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own balance" ON public.user_balances FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own balance" ON public.user_balances FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  points_amount INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- OKDUB tokens
CREATE TABLE public.okdub_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  token_amount NUMERIC NOT NULL DEFAULT 0,
  staked_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.okdub_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tokens" ON public.okdub_tokens FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tokens" ON public.okdub_tokens FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tokens" ON public.okdub_tokens FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- NFT mints
CREATE TABLE public.nft_mints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_creator_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  token_id TEXT,
  contract_address TEXT,
  tx_hash TEXT,
  network TEXT NOT NULL DEFAULT 'Ethereum',
  status TEXT NOT NULL DEFAULT 'pending',
  price NUMERIC,
  for_sale BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'Art',
  creator_royalty NUMERIC DEFAULT 5,
  is_limited_edition BOOLEAN DEFAULT false,
  edition_size INT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  minted_at TIMESTAMPTZ
);
ALTER TABLE public.nft_mints ENABLE ROW LEVEL SECURITY;
-- Users can see their own NFTs
CREATE POLICY "Users can view own NFTs" ON public.nft_mints FOR SELECT TO authenticated USING (auth.uid() = user_id);
-- Users can see NFTs that are for sale (marketplace)
CREATE POLICY "Anyone can view NFTs for sale" ON public.nft_mints FOR SELECT TO authenticated USING (for_sale = true AND status = 'completed');
CREATE POLICY "Users can insert own NFTs" ON public.nft_mints FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own NFTs" ON public.nft_mints FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Marketplace view for public NFTs with creator info
CREATE VIEW public.marketplace_nfts AS
SELECT 
  n.id, n.name, n.description, n.image_url, n.price, n.for_sale,
  n.created_at, n.minted_at, n.token_id, n.user_id,
  p.first_name, p.last_name,
  COALESCE(p.first_name, split_part(u.email, '@', 1)) as username
FROM public.nft_mints n
LEFT JOIN public.profiles p ON p.id = n.user_id
LEFT JOIN auth.users u ON u.id = n.user_id
WHERE n.for_sale = true AND n.status = 'completed';

-- Cart items
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nft_id UUID NOT NULL REFERENCES public.nft_mints(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, nft_id)
);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cart" ON public.cart_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart items" ON public.cart_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart items" ON public.cart_items FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart items" ON public.cart_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL DEFAULT 'solana',
  status TEXT NOT NULL DEFAULT 'pending',
  solana_transaction_id TEXT,
  solana_wallet_address TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Payment items
CREATE TABLE public.payment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  nft_id UUID REFERENCES public.nft_mints(id),
  price NUMERIC NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payment items" ON public.payment_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.payments WHERE payments.id = payment_items.payment_id AND payments.user_id = auth.uid())
);
CREATE POLICY "Users can insert payment items" ON public.payment_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.payments WHERE payments.id = payment_items.payment_id AND payments.user_id = auth.uid())
);

-- Wallet auth
CREATE TABLE public.wallet_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  wallet_type TEXT NOT NULL DEFAULT 'solana',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, wallet_address)
);
ALTER TABLE public.wallet_auth ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wallets" ON public.wallet_auth FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallets" ON public.wallet_auth FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wallets" ON public.wallet_auth FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Mining sessions
CREATE TABLE public.mining_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_claim_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_mined NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mining_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own mining" ON public.mining_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mining" ON public.mining_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mining" ON public.mining_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Currency deposits
CREATE TABLE public.currency_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_naira NUMERIC NOT NULL DEFAULT 0,
  amount_usd NUMERIC NOT NULL DEFAULT 0,
  exchange_rate NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  deposit_method TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.currency_deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own deposits" ON public.currency_deposits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deposits" ON public.currency_deposits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Naira wallets
CREATE TABLE public.naira_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.naira_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own naira wallet" ON public.naira_wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own naira wallet" ON public.naira_wallets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own naira wallet" ON public.naira_wallets FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL DEFAULT 'smart_contract',
  budget NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = client_user_id);

-- Bug bounties
CREATE TABLE public.bug_bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  reward_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  project_id TEXT,
  submitted_by UUID REFERENCES auth.users(id),
  claimed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bug_bounties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all bounties" ON public.bug_bounties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert bounties" ON public.bug_bounties FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Users can update bounties" ON public.bug_bounties FOR UPDATE TO authenticated USING (auth.uid() = submitted_by OR auth.uid() = claimed_by);

-- User subscriptions
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  is_active BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON public.user_subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Subscription tiers (public reference data)
CREATE TABLE public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  required_tokens NUMERIC NOT NULL DEFAULT 0,
  features TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tiers" ON public.subscription_tiers FOR SELECT TO authenticated USING (true);

-- Test runs
CREATE TABLE public.test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,
  network TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  results JSONB,
  gas_used NUMERIC,
  execution_time NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own test runs" ON public.test_runs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own test runs" ON public.test_runs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own test runs" ON public.test_runs FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Convert points to cash function
CREATE OR REPLACE FUNCTION public.convert_points_to_cash(_user_id UUID, _points_amount INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_points INT;
  _cash_amount NUMERIC;
BEGIN
  SELECT points INTO _current_points FROM public.leaderboard_stats WHERE user_id = _user_id;
  IF _current_points IS NULL OR _current_points < _points_amount THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;
  
  _cash_amount := _points_amount / 1000.0;
  
  UPDATE public.leaderboard_stats SET points = points - _points_amount, updated_at = now() WHERE user_id = _user_id;
  
  INSERT INTO public.user_balances (user_id, cash_balance, total_earned)
  VALUES (_user_id, _cash_amount, _cash_amount)
  ON CONFLICT (user_id) DO UPDATE SET
    cash_balance = user_balances.cash_balance + _cash_amount,
    total_earned = user_balances.total_earned + _cash_amount,
    updated_at = now();
    
  INSERT INTO public.transactions (user_id, transaction_type, amount, points_amount, status, description)
  VALUES (_user_id, 'conversion', _cash_amount, _points_amount, 'completed', 'Points to cash conversion');
END;
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  
  INSERT INTO public.leaderboard_stats (user_id) VALUES (NEW.id);
  INSERT INTO public.user_balances (user_id) VALUES (NEW.id);
  INSERT INTO public.okdub_tokens (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (name, required_tokens, features) VALUES
('Free', 0, ARRAY['Basic testing', '5 NFT mints/month', 'Community access']),
('Pro', 100, ARRAY['Unlimited testing', 'Unlimited NFT mints', 'Bug bounty creation', 'Priority support', 'Advanced analytics']),
('Enterprise', 500, ARRAY['Everything in Pro', 'Custom integrations', 'Dedicated support', 'White-label options']);

-- Create storage bucket for NFT images
INSERT INTO storage.buckets (id, name, public) VALUES ('nft-images', 'nft-images', true);
CREATE POLICY "Anyone can view NFT images" ON storage.objects FOR SELECT USING (bucket_id = 'nft-images');
CREATE POLICY "Authenticated users can upload NFT images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'nft-images');

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_balances_updated_at BEFORE UPDATE ON public.user_balances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_okdub_tokens_updated_at BEFORE UPDATE ON public.okdub_tokens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_naira_wallets_updated_at BEFORE UPDATE ON public.naira_wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
