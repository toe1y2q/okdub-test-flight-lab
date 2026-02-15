

# Unified Testnet Sandbox, Wallet Dashboard, Flutterwave Key UI, PWA & Bug Bounty Fixes

## Overview
This plan covers 5 major areas: a testnet sandbox for testing payments/mining, a wallet health dashboard, a UI for updating Flutterwave keys, PWA installability, and ensuring bug bounties and rewards work correctly.

---

## 1. PWA (Progressive Web App) Setup

Users will be able to install the app on their phone or desktop directly from the browser.

**Changes:**
- Install `vite-plugin-pwa` dependency
- Update `vite.config.ts` to configure PWA with manifest, icons, and service worker (with `/~oauth` in `navigateFallbackDenylist`)
- Add PWA meta tags to `index.html` (theme-color, apple-touch-icon, etc.)
- Create a new `/install` page with install prompt trigger and instructions
- Add route in `App.tsx`
- The `vercel.json` file already has the correct SPA rewrite rule (`"/(.*)" -> "/index.html"`) -- no changes needed there

**PWA Manifest config:**
- App name: "Okdub Casino"
- Short name: "Okdub"
- Theme color: #0f172a (slate-950)
- Background color: #0f172a
- Display: standalone
- Icons: Use the existing logo at `/lovable-uploads/3e7c2c9a-0c07-4a59-afbc-c68bc09a5223.png`

---

## 2. Testnet Sandbox Page

A dedicated `/sandbox` page where users can test Flutterwave payments and token mining in a sandboxed mode without real money.

**Changes:**
- Create `src/pages/Sandbox.tsx` with:
  - A "Test Payment" section using Flutterwave's test mode (test public key)
  - A "Test Mining" section that simulates mining claims without writing to the real `okdub_tokens` table
  - Visual indicators showing "TESTNET MODE" prominently
  - Mock transaction results displayed inline
- Add `/sandbox` route in `App.tsx`

---

## 3. Wallet Health Dashboard

A new `/wallet-health` page showing real-time connection status for MetaMask and Phantom (Solana) wallets.

**Changes:**
- Create `src/pages/WalletHealth.tsx` with:
  - MetaMask detection (`window.ethereum`) and connection status
  - Phantom/Solana detection (`window.solana`) and connection status
  - TonConnect placeholder (shows "Coming Soon" since TonConnect SDK is not yet installed)
  - Network info (chain ID, account address) when connected
  - "Connect" / "Disconnect" buttons for each wallet
  - Connection health indicators (green/red dots)
- Add `/wallet-health` route in `App.tsx`
- Add a "Wallet Health" quick link on the Dashboard page

---

## 4. Flutterwave Public Key Update Flow

Allow admins/users to update the Flutterwave public key from the Settings page without redeploying.

**Changes:**
- Create a database table `app_settings` to store configurable keys like the Flutterwave public key
- Add an "API Keys" section to `src/pages/Settings.tsx` with:
  - Input field for Flutterwave public key (masked by default)
  - Save button that writes to `app_settings` table
  - Only authenticated users can update their own keys
- Update `FlutterwavePayment.tsx` to read the public key from the database (with fallback to the hardcoded key)
- Create a custom hook `useFlutterwaveKey` to fetch the key

**Database migration:**
```sql
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
```

---

## 5. Bug Bounty & Rewards Fixes

After reviewing the code, the bug bounty and rewards systems are structurally correct. The key issues to fix:

**Bug Bounty fixes:**
- The `bounty_completions` table has all RLS policies set to `RESTRICTIVE` (not `PERMISSIVE`). When both the bounty creator's SELECT policy and the completer's SELECT policy are restrictive, they effectively block each other. The bounty review page (`BountyReview.tsx`) queries `bounty_completions` where the current user is the bounty creator -- but the RLS policies only allow viewing by `completed_by = auth.uid()` OR via a JOIN to `bug_bounties`. Since these are RESTRICTIVE, both conditions must match simultaneously, which fails. Fix: Change these policies to PERMISSIVE.

**Database migration to fix RLS:**
```sql
-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Bounty creators can view completions" ON bounty_completions;
DROP POLICY IF EXISTS "Users can view own completions" ON bounty_completions;
DROP POLICY IF EXISTS "Bounty creators can update completions" ON bounty_completions;
DROP POLICY IF EXISTS "Completers can update own" ON bounty_completions;
DROP POLICY IF EXISTS "Users can insert completions" ON bounty_completions;

-- Recreate as PERMISSIVE (default)
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
```

**Rewards page:** The rewards page works correctly -- it reads from `leaderboard_stats` and shows achievement badges based on thresholds. No code changes needed, but the rewards only unlock when actual data exists (tests run, NFTs minted). This is working as designed.

---

## Technical Summary

| File | Change |
|------|--------|
| `vite.config.ts` | Add vite-plugin-pwa configuration |
| `index.html` | Add PWA meta tags |
| `src/pages/Install.tsx` | **New** -- PWA install page |
| `src/pages/Sandbox.tsx` | **New** -- Testnet sandbox for payments/mining |
| `src/pages/WalletHealth.tsx` | **New** -- Wallet connection health dashboard |
| `src/App.tsx` | Add 3 new routes: /install, /sandbox, /wallet-health |
| `src/pages/Settings.tsx` | Add Flutterwave public key management section |
| `src/hooks/useFlutterwaveKey.tsx` | **New** -- Hook to fetch Flutterwave key from DB |
| `src/components/FlutterwavePayment.tsx` | Use dynamic key from useFlutterwaveKey hook |
| `src/pages/Dashboard.tsx` | Add Wallet Health quick link |
| Database migration | Create `app_settings` table, fix `bounty_completions` RLS policies |

