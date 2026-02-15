
-- Fix security issue: Drop the view that exposes auth.users and recreate with security_invoker
DROP VIEW IF EXISTS public.marketplace_nfts;

CREATE VIEW public.marketplace_nfts
WITH (security_invoker=on) AS
SELECT 
  n.id, n.name, n.description, n.image_url, n.price, n.for_sale,
  n.created_at, n.minted_at, n.token_id, n.user_id,
  p.first_name, p.last_name,
  COALESCE(p.first_name, 'Anonymous') as username
FROM public.nft_mints n
LEFT JOIN public.profiles p ON p.id = n.user_id
WHERE n.for_sale = true AND n.status = 'completed';

-- Bounty completions table
CREATE TABLE public.bounty_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id UUID NOT NULL REFERENCES public.bug_bounties(id) ON DELETE CASCADE,
  completed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completion_proof TEXT NOT NULL,
  completion_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bounty_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own completions" ON public.bounty_completions FOR SELECT TO authenticated USING (completed_by = auth.uid());
CREATE POLICY "Bounty creators can view completions" ON public.bounty_completions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bug_bounties WHERE bug_bounties.id = bounty_completions.bounty_id AND bug_bounties.submitted_by = auth.uid())
);
CREATE POLICY "Users can insert completions" ON public.bounty_completions FOR INSERT TO authenticated WITH CHECK (auth.uid() = completed_by);
CREATE POLICY "Bounty creators can update completions" ON public.bounty_completions FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bug_bounties WHERE bug_bounties.id = bounty_completions.bounty_id AND bug_bounties.submitted_by = auth.uid())
);
CREATE POLICY "Completers can update own" ON public.bounty_completions FOR UPDATE TO authenticated USING (auth.uid() = completed_by);

-- NFT sales table
CREATE TABLE public.nft_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id UUID NOT NULL REFERENCES public.nft_mints(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id),
  price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'listed',
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.nft_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all sales" ON public.nft_sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own sales" ON public.nft_sales FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own sales" ON public.nft_sales FOR UPDATE TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Buyers can update purchased sales" ON public.nft_sales FOR UPDATE TO authenticated USING (auth.uid() = buyer_id);
