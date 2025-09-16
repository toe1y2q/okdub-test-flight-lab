import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePaymentGuard = () => {
  const { user, isAuthenticated } = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      checkSubscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const checkSubscriptionStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setHasActiveSubscription(!!data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasActiveSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  const requirePayment = (featureName: string = 'this feature') => {
    if (!hasActiveSubscription) {
      toast.error(`Please upgrade to access ${featureName}`);
      return false;
    }
    return true;
  };

  return {
    hasActiveSubscription,
    loading,
    requirePayment,
    checkSubscriptionStatus
  };
};