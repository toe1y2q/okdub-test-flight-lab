
-- Create naira_wallets table
CREATE TABLE public.naira_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.naira_wallets ENABLE ROW LEVEL SECURITY;

-- Create policies for naira_wallets
CREATE POLICY "Users can view their own naira wallet" 
  ON public.naira_wallets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own naira wallet" 
  ON public.naira_wallets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own naira wallet" 
  ON public.naira_wallets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_naira_wallets_updated_at 
  BEFORE UPDATE ON public.naira_wallets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
