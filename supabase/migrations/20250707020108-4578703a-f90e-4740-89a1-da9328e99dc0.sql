
-- Add wallet authentication table
CREATE TABLE public.wallet_auth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  wallet_address TEXT NOT NULL UNIQUE,
  wallet_type TEXT NOT NULL DEFAULT 'solana',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add balance and transactions table
CREATE TABLE public.user_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  points_balance INTEGER NOT NULL DEFAULT 0,
  cash_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_earned DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_withdrawn DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  transaction_type TEXT NOT NULL, -- 'points_to_cash', 'withdrawal', 'earned_points'
  amount DECIMAL(10,2) NOT NULL,
  points_amount INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.wallet_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for wallet_auth
CREATE POLICY "Users can view own wallet auth" ON public.wallet_auth FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallet auth" ON public.wallet_auth FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet auth" ON public.wallet_auth FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_balances
CREATE POLICY "Users can view own balance" ON public.user_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own balance" ON public.user_balances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own balance" ON public.user_balances FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update the handle_new_user function to create balance entry
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
  
  INSERT INTO public.user_balances (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$;

-- Function to convert points to cash
CREATE OR REPLACE FUNCTION public.convert_points_to_cash(
  _user_id UUID,
  _points_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _cash_amount DECIMAL(10,2);
  _current_points INTEGER;
BEGIN
  -- Get current points from leaderboard_stats
  SELECT points INTO _current_points
  FROM public.leaderboard_stats
  WHERE user_id = _user_id;
  
  -- Check if user has enough points
  IF _current_points < _points_amount THEN
    RAISE EXCEPTION 'Insufficient points balance';
  END IF;
  
  -- Calculate cash amount (1000 points = $1.00)
  _cash_amount := _points_amount / 1000.0;
  
  -- Start transaction
  BEGIN
    -- Deduct points from leaderboard_stats
    UPDATE public.leaderboard_stats 
    SET points = points - _points_amount,
        updated_at = now()
    WHERE user_id = _user_id;
    
    -- Add cash to user_balances
    UPDATE public.user_balances 
    SET cash_balance = cash_balance + _cash_amount,
        total_earned = total_earned + _cash_amount,
        updated_at = now()
    WHERE user_id = _user_id;
    
    -- Record transaction
    INSERT INTO public.transactions (user_id, transaction_type, amount, points_amount, status, description)
    VALUES (_user_id, 'points_to_cash', _cash_amount, _points_amount, 'completed', 
            'Converted ' || _points_amount || ' points to $' || _cash_amount);
            
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
  END;
END;
$$;
