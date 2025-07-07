
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  wallet_address TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create test runs table
CREATE TABLE public.test_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  test_type TEXT NOT NULL,
  network TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  gas_used BIGINT,
  block_number BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create NFT mints table
CREATE TABLE public.nft_mints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  token_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  metadata_url TEXT,
  contract_address TEXT,
  tx_hash TEXT,
  network TEXT NOT NULL DEFAULT 'sepolia',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  minted_at TIMESTAMP WITH TIME ZONE
);

-- Create leaderboard stats table
CREATE TABLE public.leaderboard_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  total_tests INTEGER NOT NULL DEFAULT 0,
  total_nfts INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  points INTEGER NOT NULL DEFAULT 0,
  weekly_points INTEGER NOT NULL DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_mints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for test_runs
CREATE POLICY "Users can view own test runs" ON public.test_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own test runs" ON public.test_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own test runs" ON public.test_runs FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for nft_mints
CREATE POLICY "Users can view own NFT mints" ON public.nft_mints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own NFT mints" ON public.nft_mints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own NFT mints" ON public.nft_mints FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for leaderboard_stats
CREATE POLICY "Users can view all leaderboard stats" ON public.leaderboard_stats FOR SELECT USING (true);
CREATE POLICY "Users can update own stats" ON public.leaderboard_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON public.leaderboard_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, wallet_address, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'wallet_address',
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  
  INSERT INTO public.leaderboard_stats (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create storage bucket for NFT images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('nft-images', 'nft-images', true);

-- Create storage policy for NFT images
CREATE POLICY "Anyone can view NFT images" ON storage.objects FOR SELECT USING (bucket_id = 'nft-images');
CREATE POLICY "Users can upload NFT images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'nft-images' AND auth.role() = 'authenticated');
