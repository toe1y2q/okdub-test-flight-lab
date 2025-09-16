import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Home, Receipt, Zap } from 'lucide-react';
import { Starfield } from '@/components/Starfield';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentType = searchParams.get('type') || 'nft';
  const amount = searchParams.get('amount') || '0';
  const currency = searchParams.get('currency') || 'USD';

  useEffect(() => {
    toast.success('Payment completed successfully!');
  }, []);

  const getSuccessMessage = () => {
    switch (paymentType) {
      case 'nft':
        return {
          title: 'NFT Purchase Complete!',
          description: 'Your NFT(s) have been successfully purchased and added to your collection.',
          actionText: 'View My NFTs',
          actionPath: '/nfts'
        };
      case 'deposit':
        return {
          title: 'Deposit Successful!',
          description: 'Your deposit has been processed and added to your account balance.',
          actionText: 'View Balance',
          actionPath: '/balance'
        };
      case 'subscription':
        return {
          title: 'Subscription Activated!',
          description: 'Your premium subscription is now active. Enjoy all the benefits!',
          actionText: 'Go to Dashboard',
          actionPath: '/dashboard'
        };
      default:
        return {
          title: 'Payment Successful!',
          description: 'Your payment has been processed successfully.',
          actionText: 'Continue',
          actionPath: '/dashboard'
        };
    }
  };

  const successInfo = getSuccessMessage();

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-poppins">
      <Starfield />
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex justify-between items-center p-6 backdrop-blur-sm"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center"
          >
            <Zap className="w-6 h-6 text-white" />
          </motion.div>
          <span className="text-3xl font-bold gradient-text">
            Okdub
          </span>
        </motion.div>
      </motion.nav>

      <div className="relative z-10 flex items-center justify-center min-h-[80vh] p-6">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <Card className="p-8 text-center glass-morphism border-glass-border/20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {successInfo.title}
              </h1>
              <p className="text-muted-foreground mb-6">
                {successInfo.description}
              </p>

              <div className="bg-glass/30 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount Paid:</span>
                  <span className="font-semibold text-foreground">
                    {currency === 'SOL' ? `${amount} SOL` : `${currency}${amount}`}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate(successInfo.actionPath)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {successInfo.actionText}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="w-full border-glass-border/30 hover:bg-glass/20"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>

                {paymentType === 'nft' && (
                  <Button
                    onClick={() => navigate('/marketplace')}
                    variant="ghost"
                    className="w-full hover:bg-glass/20"
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                )}
              </div>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;