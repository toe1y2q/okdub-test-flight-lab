import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Starfield } from '@/components/Starfield';
import { LogOut, Wallet, TrendingUp, CreditCard, DollarSign, Coins } from 'lucide-react';
import { toast } from 'sonner';

interface UserBalance {
  id: string;
  cash_balance: number;
  points_balance: number;
  total_earned: number;
  total_withdrawn: number;
}

interface StakingPosition {
  id: string;
  amount_staked: number;
  current_value: number;
  roi_percentage: number;
  status: string;
  start_date: string;
  end_date: string;
}

const Balance = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>([]);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  const fetchBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Create balance record if it doesn't exist
        const { data: newBalance, error: createError } = await supabase
          .from('user_balances')
          .insert({
            user_id: user?.id,
            cash_balance: 0,
            points_balance: 0,
            total_earned: 0,
            total_withdrawn: 0
          })
          .select()
          .single();
          
        if (createError) throw createError;
        setBalance(newBalance);
      } else {
        setBalance(data);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Failed to load balance');
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchStakingPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('staking_positions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStakingPositions(data || []);
    } catch (error) {
      console.error('Error fetching staking positions:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance();
      fetchStakingPositions();
    }
  }, [isAuthenticated]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-poppins flex items-center justify-center">
        <Starfield />
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-poppins">
      <Starfield />
      
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
          <motion.img
            src="/lovable-uploads/d6075415-c86b-4692-8b91-5fe9033284cd.png"
            alt="Okdub Casino"
            className="w-12 h-12 object-contain"
            animate={{ 
              filter: ["drop-shadow(0 0 10px rgba(6, 182, 212, 0.5))", "drop-shadow(0 0 20px rgba(147, 51, 234, 0.5))", "drop-shadow(0 0 10px rgba(6, 182, 212, 0.5))"] 
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Okdub Casino
          </span>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate('/currency-deposit')} variant="outline" size="sm" className="border-green-500/50 text-green-400 hover:bg-green-500/10">
            <CreditCard className="w-4 h-4 mr-2" />
            Deposit
          </Button>
          <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm" className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10">
            Back to Dashboard
          </Button>
          <Button onClick={handleSignOut} variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </motion.nav>

      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-3 text-cyan-400">Your Balance</h1>
          <p className="text-xl text-gray-400">View and manage your account balances</p>
        </motion.div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="staking">Staking Positions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Wallet className="w-5 h-5 mr-2 text-green-400" />
                  Cash Balance
                </h3>
                {loadingBalance ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                  </div>
                ) : balance ? (
                  <>
                    <p className="text-4xl font-bold text-green-400">${balance.cash_balance.toLocaleString()}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Total Earned: ${balance.total_earned.toLocaleString()} | Total Withdrawn: ${balance.total_withdrawn.toLocaleString()}
                    </p>
                    <Button onClick={() => navigate('/currency-deposit')} className="w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Deposit Funds
                    </Button>
                  </>
                ) : (
                  <p className="text-gray-400">No balance information available</p>
                )}
              </Card>

              <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Coins className="w-5 h-5 mr-2 text-yellow-400" />
                  Points Balance
                </h3>
                {loadingBalance ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                  </div>
                ) : balance ? (
                  <>
                    <p className="text-4xl font-bold text-yellow-400">{balance.points_balance.toLocaleString()} Points</p>
                    <p className="text-sm text-gray-400 mt-2">Use points for exclusive rewards and benefits</p>
                    <Button disabled className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-yellow-600 opacity-50">
                      Redeem Points (Coming Soon)
                    </Button>
                  </>
                ) : (
                  <p className="text-gray-400">No balance information available</p>
                )}
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="staking">
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
                Staking Positions
              </h3>
              
              {stakingPositions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No staking positions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stakingPositions.map((position) => (
                    <div key={position.id} className="bg-slate-800/30 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">Position ID: {position.id.slice(0, 8)}...</p>
                          <p className="text-sm text-gray-400">Amount Staked: ${position.amount_staked.toLocaleString()}</p>
                          <p className="text-sm text-gray-400">Current Value: ${position.current_value.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">
                            Start Date: {new Date(position.start_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            End Date: {new Date(position.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              position.status === 'active'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {position.status}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">ROI: {position.roi_percentage}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Balance;
