
-- Update RLS policy to allow public viewing of NFTs for marketplace
DROP POLICY IF EXISTS "Users can view own NFT mints" ON public.nft_mints;

-- Create new policies for NFT marketplace
CREATE POLICY "Users can view own NFT mints" 
ON public.nft_mints 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view completed NFTs for marketplace" 
ON public.nft_mints 
FOR SELECT 
USING (status = 'completed');

-- Add marketplace-specific columns to nft_mints
ALTER TABLE public.nft_mints 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS for_sale BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by_username TEXT;

-- Update profiles table to include username for marketplace display
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create a view for marketplace NFTs with creator info
CREATE OR REPLACE VIEW public.marketplace_nfts AS
SELECT 
  n.*,
  p.username,
  p.first_name,
  p.last_name
FROM public.nft_mints n
LEFT JOIN public.profiles p ON n.user_id = p.id
WHERE n.status = 'completed';
