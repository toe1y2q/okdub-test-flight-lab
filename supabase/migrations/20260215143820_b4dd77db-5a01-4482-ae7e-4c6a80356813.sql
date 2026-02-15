
-- Create app_settings table
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  setting_key text NOT NULL,
  setting_value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, setting_key)
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON public.app_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.app_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.app_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Fix bounty_completions RLS: drop restrictive and recreate as permissive
DROP POLICY IF EXISTS "Bounty creators can view completions" ON bounty_completions;
DROP POLICY IF EXISTS "Users can view own completions" ON bounty_completions;
DROP POLICY IF EXISTS "Bounty creators can update completions" ON bounty_completions;
DROP POLICY IF EXISTS "Completers can update own" ON bounty_completions;
DROP POLICY IF EXISTS "Users can insert completions" ON bounty_completions;

CREATE POLICY "Bounty creators can view completions" ON bounty_completions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bug_bounties WHERE bug_bounties.id = bounty_completions.bounty_id AND bug_bounties.submitted_by = auth.uid())
  );

CREATE POLICY "Users can view own completions" ON bounty_completions
  FOR SELECT USING (completed_by = auth.uid());

CREATE POLICY "Bounty creators can update completions" ON bounty_completions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM bug_bounties WHERE bug_bounties.id = bounty_completions.bounty_id AND bug_bounties.submitted_by = auth.uid())
  );

CREATE POLICY "Completers can update own" ON bounty_completions
  FOR UPDATE USING (auth.uid() = completed_by);

CREATE POLICY "Users can insert completions" ON bounty_completions
  FOR INSERT WITH CHECK (auth.uid() = completed_by);
