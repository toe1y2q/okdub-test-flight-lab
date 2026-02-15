

# Fix Payments, Wallet, Flutterwave Integration, Token Miner & Performance

## Overview
This plan addresses 5 key areas: broken payments/wallet, Flutterwave API key setup, pricing integration with Flutterwave, token miner improvements, and performance optimization for the lagging website.

---

## 1. Flutterwave API Key Setup

Currently, the Flutterwave public key is **hardcoded** in `FlutterwavePayment.tsx` (line 22). This is a publishable key so it's acceptable in the codebase, but you'll need to provide your own Flutterwave public key to replace the existing one.

Once you confirm your Flutterwave public key, it will be stored in the code. For the **secret key** (needed for payment verification), it will be securely stored as an environment secret and used in a backend function to verify transactions.

**What's needed from you:**
- Your Flutterwave **public key** (starts with `FLWPUBK-`)
- Your Flutterwave **secret key** (starts with `FLWSECK-`) for server-side verification

---

## 2. Fix Payments Not Working

**Problems identified:**
- `SolanaPayment.tsx` uses a simulated balance check (`Math.random()`) instead of real wallet interaction -- payments "complete" without actual Solana deduction
- `FlutterwavePayment.tsx` loads the Flutterwave script dynamically but doesn't verify payments server-side
- No payment verification backend function exists

**Fix plan:**
- Create a backend function `verify-flutterwave-payment` that verifies transaction status with Flutterwave's API using the secret key
- Update `FlutterwavePayment.tsx` to call verification after callback
- Update `SolanaPayment.tsx` to require actual wallet signature before marking payment complete
- Add proper error handling and payment status tracking

---

## 3. Connect Pricing Page to Flutterwave

**Problem:** The Pricing page's "Upgrade to Pro" button directly updates the database without requiring payment.

**Fix plan:**
- When user clicks "Upgrade to Pro", open Flutterwave checkout for $29
- Only after successful payment + server verification, update subscription to "pro"
- Add Flutterwave payment option on the Pricing page
- Keep the `PaymentGuard` component but integrate it with actual payment flow

---

## 4. Fix Wallet Deposits & Withdrawals

**Problems identified:**
- `SolanaWithdrawal.tsx` simulates transactions with `setTimeout` and mock tx hashes -- no real Solana interaction
- `CurrencyDeposit.tsx` Solana deposit just inserts a "pending" record without actual wallet transaction
- Wallet connection depends on Phantom browser extension which may not be installed

**Fix plan:**
- Add clear messaging when Phantom wallet is not installed (link to install)
- For Solana deposits: require actual wallet transaction signature before recording deposit
- For withdrawals: add proper validation and show "feature coming soon" for actual Solana transfers (since real transfers need a backend signing wallet)
- Ensure Flutterwave deposits work end-to-end with verification

---

## 5. Token Miner Setup

The token miner at `src/pages/Mining.tsx` is already functional with:
- 0.05 OKDUB tokens per day mining rate
- Hourly claim intervals
- Database integration with `mining_sessions` and `okdub_tokens` tables

**Improvements planned:**
- Add a visual mining animation (pickaxe/coin animation)
- Add mining stats dashboard (total mined across all sessions)
- Ensure the miner doesn't run multiple concurrent sessions per user

---

## 6. Performance Debugging & Fixes

**Major performance issues identified:**

### A. Starfield Component (BIGGEST ISSUE)
The `Starfield.tsx` renders **300 stars** with canvas animations running via `requestAnimationFrame` on **every single page**. Each star has:
- Shadow blur effects (`ctx.shadowBlur`)
- Cross glow effects for large stars
- Gradient background recalculated every frame

This runs continuously even when not visible.

**Fix:** Reduce stars to 100, remove shadow blur (very expensive), simplify animation, and add `will-change` optimization.

### B. usePageTransition Hook
Every route change triggers a fake 300ms loading delay (`setTimeout`), making navigation feel sluggish for no benefit.

**Fix:** Remove the artificial delay entirely.

### C. AnimatePresence with mode="wait"
`AnimatePresence mode="wait"` in `App.tsx` forces exit animations to complete before enter animations start, adding perceived delay.

**Fix:** Remove `mode="wait"` or switch to `mode="sync"`.

### D. Framer Motion Overuse
Nearly every page has:
- Nav bar animation (`initial={{ y: -100 }}`) 
- Logo spinning infinitely (`animate={{ rotate: 360 }}`)
- Multiple `whileHover` scale animations

**Fix:** Reduce animation complexity, remove infinite spinning logo animation, use CSS transitions instead of Framer Motion for simple hover effects.

### E. LoadingScreen Component
Uses heavy Framer Motion animations for a loading indicator.

**Fix:** Simplify to a lightweight CSS-only spinner.

---

## Technical Summary of Changes

| File | Change |
|------|--------|
| `src/components/Starfield.tsx` | Reduce stars to 100, remove shadowBlur, simplify rendering |
| `src/hooks/usePageTransition.tsx` | Remove artificial 300ms delay |
| `src/App.tsx` | Remove `AnimatePresence mode="wait"`, simplify route wrapping |
| `src/components/LoadingScreen.tsx` | Simplify to CSS-only loading |
| `src/components/FlutterwavePayment.tsx` | Accept API key as prop or env, add server verification call |
| `src/components/SolanaPayment.tsx` | Require real wallet signature, remove fake balance check |
| `src/pages/Pricing.tsx` | Integrate Flutterwave payment for Pro upgrade |
| `src/pages/SolanaWithdrawal.tsx` | Add Phantom install check, improve UX messaging |
| `src/pages/CurrencyDeposit.tsx` | Fix Flutterwave deposit verification flow |
| `src/pages/Mining.tsx` | Add duplicate session prevention, visual improvements |
| `supabase/functions/verify-flutterwave-payment/index.ts` | **New** -- backend function to verify Flutterwave payments |

