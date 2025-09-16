import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { usePaymentGuard } from '@/hooks/usePaymentGuard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock } from 'lucide-react';

interface PaymentGuardProps {
  children: ReactNode;
  feature?: string;
  fallback?: ReactNode;
}

export const PaymentGuard = ({ children, feature = 'this feature', fallback }: PaymentGuardProps) => {
  const { hasActiveSubscription, loading } = usePaymentGuard();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasActiveSubscription) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center py-12"
      >
        <Card className="p-8 max-w-md mx-auto text-center bg-card border-border">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Premium Feature</h3>
            <p className="text-muted-foreground">
              You need an active subscription to access {feature}
            </p>
          </div>
          <Button
            onClick={() => navigate('/pricing')}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </Card>
      </motion.div>
    );
  }

  return <>{children}</>;
};