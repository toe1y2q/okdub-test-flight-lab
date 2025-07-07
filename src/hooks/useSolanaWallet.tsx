
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

declare global {
  interface Window {
    solana?: any;
  }
}

export const useSolanaWallet = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (window.solana && window.solana.isPhantom) {
      setWallet(window.solana);
    }
  }, []);

  const connectWallet = async () => {
    if (!wallet) {
      toast.error('Please install Phantom wallet');
      return null;
    }

    setConnecting(true);
    try {
      const response = await wallet.connect();
      const publicKey = response.publicKey.toString();
      setConnected(true);
      
      toast.success('Wallet connected successfully!');
      return publicKey;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      toast.error('Failed to connect wallet');
      return null;
    } finally {
      setConnecting(false);
    }
  };

  const signInWithWallet = async () => {
    const publicKey = await connectWallet();
    if (!publicKey) return;

    try {
      // Create a message to sign
      const message = `Sign in to Okdub with wallet: ${publicKey}`;
      const encodedMessage = new TextEncoder().encode(message);
      
      // Sign the message
      const signedMessage = await wallet.signMessage(encodedMessage);
      
      // Use wallet address as email for Supabase auth
      const walletEmail = `${publicKey.slice(0, 8)}@wallet.okdub`;
      
      // Try to sign in first
      let { data, error } = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: publicKey,
      });

      // If sign in fails, create new account
      if (error && error.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: walletEmail,
          password: publicKey,
          options: {
            data: {
              wallet_address: publicKey,
              wallet_type: 'solana'
            },
            emailRedirectTo: window.location.origin
          }
        });

        if (signUpError) {
          throw signUpError;
        }
        data = signUpData;
      } else if (error) {
        throw error;
      }

      // Store wallet connection info
      if (data.user) {
        await supabase.from('wallet_auth').upsert({
          user_id: data.user.id,
          wallet_address: publicKey,
          wallet_type: 'solana',
          is_primary: true
        });
      }

      toast.success('Successfully signed in with wallet!');
      return data;
    } catch (error) {
      console.error('Wallet sign in failed:', error);
      toast.error('Failed to sign in with wallet');
      return null;
    }
  };

  const disconnectWallet = async () => {
    if (wallet) {
      await wallet.disconnect();
      setConnected(false);
    }
  };

  return {
    wallet,
    connected,
    connecting,
    connectWallet,
    signInWithWallet,
    disconnectWallet,
    isPhantomInstalled: !!wallet
  };
};
