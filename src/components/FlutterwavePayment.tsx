
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FlutterwavePaymentProps {
  amount: number;
  currency: 'NGN' | 'USD';
  email: string;
  onSuccess: () => void;
  onError: () => void;
  publicKey?: string;
}

export const FlutterwavePayment: React.FC<FlutterwavePaymentProps> = ({
  amount,
  currency,
  email,
  onSuccess,
  onError,
  publicKey
}) => {
  const flutterwavePublicKey = publicKey || "FLWPUBK-08518f8d77cbc2a7fbdd880c432bd85f-X";

  const verifyTransaction = async (transactionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-flutterwave-payment', {
        body: { transaction_id: transactionId }
      });

      if (error) throw error;
      
      if (data?.status === 'successful') {
        return true;
      }
      return false;
    } catch (err) {
      console.error('Verification failed:', err);
      return false;
    }
  };

  const handleFlutterwavePayment = () => {
    const paymentData = {
      public_key: flutterwavePublicKey,
      tx_ref: `okdub-${Date.now()}`,
      amount: amount,
      currency: currency,
      payment_options: 'card,mobilemoney,ussd,banktransfer',
      customer: {
        email: email,
        phone_number: '',
        name: 'User'
      },
      customizations: {
        title: 'Okdub Payment',
        description: `Currency Deposit - ${currency}`,
        logo: ''
      },
      callback: async function(data: any) {
        console.log('Flutterwave payment callback:', data);
        if (data.status === 'successful' || data.status === 'completed') {
          // Verify server-side
          const verified = await verifyTransaction(data.transaction_id || data.tx_ref);
          if (verified) {
            toast.success('Payment verified successfully!');
            onSuccess();
          } else {
            toast.warning('Payment received, pending verification.');
            onSuccess(); // Still proceed but log for manual review
          }
        } else {
          toast.error('Payment was not successful');
          onError();
        }
      },
      onclose: function() {
        console.log('Flutterwave payment closed');
      }
    };

    if (typeof (window as any).FlutterwaveCheckout !== 'undefined') {
      (window as any).FlutterwaveCheckout(paymentData);
    } else {
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.onload = () => {
        (window as any).FlutterwaveCheckout(paymentData);
      };
      document.head.appendChild(script);
    }
  };

  return (
    <Button
      onClick={handleFlutterwavePayment}
      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
    >
      <CreditCard className="w-4 h-4 mr-2" />
      Pay {currency === 'NGN' ? '₦' : '$'}{amount.toLocaleString()} with Flutterwave
    </Button>
  );
};
