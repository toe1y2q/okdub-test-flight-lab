
-- Add currency conversion and deposits table
CREATE TABLE public.currency_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount_naira DECIMAL(15,2) NOT NULL,
  amount_usd DECIMAL(15,2) NOT NULL,
  exchange_rate DECIMAL(10,4) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  deposit_method TEXT NOT NULL DEFAULT 'bank_transfer',
  transaction_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add mining sessions table
CREATE TABLE public.mining_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_claim_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_mined DECIMAL(15,8) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.currency_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mining_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for currency_deposits
CREATE POLICY "Users can view their own deposits" 
  ON public.currency_deposits 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deposits" 
  ON public.currency_deposits 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deposits" 
  ON public.currency_deposits 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for mining_sessions
CREATE POLICY "Users can view their own mining sessions" 
  ON public.mining_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mining sessions" 
  ON public.mining_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mining sessions" 
  ON public.mining_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Update payments table to require Solana
ALTER TABLE public.payments 
ALTER COLUMN payment_method SET DEFAULT 'solana';

-- Add constraint to ensure only Solana payments are allowed
ALTER TABLE public.payments 
ADD CONSTRAINT payments_solana_only 
CHECK (payment_method = 'solana');
