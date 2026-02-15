
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_KEY = 'FLWPUBK-08518f8d77cbc2a7fbdd880c432bd85f-X';

export const useFlutterwaveKey = () => {
  const [publicKey, setPublicKey] = useState(DEFAULT_KEY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data, error } = await (supabase as any)
          .from('app_settings')
          .select('setting_value')
          .eq('user_id', user.id)
          .eq('setting_key', 'flutterwave_public_key')
          .maybeSingle();

        if (!error && data?.setting_value) {
          setPublicKey(data.setting_value);
        }
      } catch {
        // fallback to default
      } finally {
        setLoading(false);
      }
    };
    fetchKey();
  }, []);

  return { publicKey, loading };
};
