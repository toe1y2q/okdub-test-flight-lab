
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Wallet, Loader2 } from 'lucide-react';

// Simulate balance check (in real implementation, query Solana blockchain)
const simulateBalanceCheck = async (publicKey: string, requiredAmount: number): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  return Math.random() > 0.1; // 90% success rate for simulation
};

interface SolanaPaymentProps {
  totalAmount: number;
  cartItems: any[];
  onPaymentSuccess: () => void;
}

export const SolanaPayment = ({ totalAmount, cartItems, onPaymentSuccess }: SolanaPaymentProps) => {
  const { wallet, connected, connectWallet, signInWithWallet } = useSolanaWallet();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);

  const handleSolanaPayment = async () => {
    if (!connected || !wallet) {
      toast.error('Please connect your Solana wallet first');
      const result = await signInWithWallet();
      if (!result) return;
    }

    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    // Validate wallet connection and balance
    if (!wallet.publicKey) {
      toast.error('Wallet not properly connected');
      return;
    }

    setProcessing(true);
    try {
      // Simulate actual Solana transaction with validation
      const publicKey = wallet.publicKey.toString();
      
      // Check if user has sufficient SOL balance (simulate check)
      const hasBalance = await simulateBalanceCheck(publicKey, totalAmount);
      if (!hasBalance) {
        toast.error('Insufficient SOL balance for this transaction');
        return;
      }

      // Simulate actual blockchain transaction
      const mockTransactionId = `solana_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          currency: 'SOL',
          payment_method: 'solana',
          status: 'completed',
          solana_transaction_id: mockTransactionId,
          solana_wallet_address: publicKey,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Create payment items
      const paymentItems = cartItems.map(item => ({
        payment_id: payment.id,
        nft_id: item.nft.id,
        price: item.nft.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('payment_items')
        .insert(paymentItems);

      if (itemsError) throw itemsError;

      toast.success('Payment completed with Solana!');
      // Redirect to payment success page
      window.location.href = `/payment-success?type=nft&amount=${totalAmount}&currency=SOL`;
      onPaymentSuccess();
    } catch (error) {
      console.error('Solana payment error:', error);
      toast.error('Solana payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <Wallet className="w-5 h-5 mr-2 text-purple-400" />
        Pay with Solana
      </h3>
      
      <div className="mb-4">
        <p className="text-gray-300 mb-2">Total: {totalAmount.toFixed(2)} SOL</p>
        <p className="text-sm text-gray-400">Fast, secure, and decentralized payments</p>
      </div>

      {!connected ? (
        <Button
          onClick={connectWallet}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Solana Wallet
        </Button>
      ) : (
        <Button
          onClick={handleSolanaPayment}
          disabled={processing || !user}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Pay {totalAmount.toFixed(2)} SOL
            </>
          )}
        </Button>
      )}
    </Card>
  );
};
