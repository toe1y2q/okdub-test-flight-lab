
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

interface FlutterwavePaymentProps {
  amount: number;
  currency: 'NGN' | 'USD';
  email: string;
  onSuccess: () => void;
  onError: () => void;
}

export const FlutterwavePayment: React.FC<FlutterwavePaymentProps> = ({
  amount,
  currency,
  email,
  onSuccess,
  onError
}) => {
  const handleFlutterwavePayment = () => {
    const flutterwavePublicKey = "FLWPUBK-08518f8d77cbc2a7fbdd880c432bd85f-X";
    
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
      callback: function(data: any) {
        console.log('Flutterwave payment successful:', data);
        if (data.status === 'successful') {
          onSuccess();
        } else {
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
      Pay ₦{amount.toLocaleString()} with Flutterwave
    </Button>
  );
};
