import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentGuard } from '@/hooks/usePaymentGuard';
import { toast } from 'sonner';

interface PaymentProtectionProps {
  children: ReactNode;
  feature: string;
  redirectTo?: string;
}

export const PaymentProtection = ({ children, feature, redirectTo = '/pricing' }: PaymentProtectionProps) => {
  const { hasActiveSubscription, loading, requirePayment } = usePaymentGuard();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !hasActiveSubscription) {
      if (!requirePayment(feature)) {
        navigate(redirectTo);
      }
    }
  }, [loading, hasActiveSubscription, requirePayment, feature, navigate, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
};