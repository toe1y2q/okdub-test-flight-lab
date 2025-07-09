
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Starfield } from '@/components/Starfield';
import { LogOut, Zap, DollarSign, TrendingUp, History, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

interface UserBalance {
  points_balance: number;
  cash_balance: number;
  total_earned: number;
  total_withdrawn: number;
}

interface LeaderboardStats {
  points: number;
  weekly_points: number;
  total_nfts: number;
  total_tests: number;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  points_amount: number;
  status: string;
  description: string;
  created_at: string;
}

const Balance = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [pointsToConvert, setPointsToConvert] = useState<string>('');
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBalance();
      fetchStats();
      fetchTransactions();
    }
  }, [isAuthenticated, user]);

  const fetchBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setBalance(data || { points_balance: 0, cash_balance: 0, total_earned: 0, total_withdrawn: 0 });
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard_stats')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setStats(data || { points: 0, weekly_points: 0, total_nfts: 0, total_tests: 0 });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleConvertPoints = async () => {
    const points = parseInt(pointsToConvert);
    if (!points || points < 1000) {
      toast.error('Minimum conversion is 1000 points');
      return;
    }

    setConverting(true);
    try {
      const { error } = await supabase.rpc('convert_points_to_cash', {
        _user_id: user?.id,
        _points_amount: points
      });

      if (error) throw error;

      toast.success(`Successfully converted ${points} points to $${(points / 1000).toFixed(2)}!`);
      setPointsToConvert('');
      fetchBalance();
      fetchStats();
      fetchTransactions();
    } catch (error: any) {
      console.error('Error converting points:', error);
      toast.error(error.message || 'Failed to convert points');
    } finally {
      setConverting(false);
    }
  };

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
            className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center"
          >
            <Zap className="w-6 h-6 text-white" />
          </motion.div>
          <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Okdub
          </span>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            size="sm"
            className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
          >
            Dashboard
          </Button>
          <Button
            onClick={() => navigate('/marketplace')}
            variant="outline"
            size="sm"
            className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
          >
            Marketplace
          </Button>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </motion.nav>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-3 text-cyan-400">Balance & Earnings</h1>
          <p className="text-xl text-gray-400">Manage your points and cash balance</p>
        </motion.div>

        {/* Balance Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6 backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-cyan-400" />
              <span className="text-sm text-cyan-400 font-semibold">Points Balance</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.points || 0}</p>
            <p className="text-sm text-gray-400 mt-1">Available Points</p>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-400" />
              <span className="text-sm text-green-400 font-semibold">Cash Balance</span>
            </div>
            <p className="text-3xl font-bold text-white">${(balance?.cash_balance || 0).toFixed(2)}</p>
            <p className="text-sm text-gray-400 mt-1">Available Cash</p>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <span className="text-sm text-purple-400 font-semibold">Total Earned</span>
            </div>
            <p className="text-3xl font-bold text-white">${(balance?.total_earned || 0).toFixed(2)}</p>
            <p className="text-sm text-gray-400 mt-1">Lifetime Earnings</p>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/30">
            <div className="flex items-center justify-between mb-4">
              <ArrowRightLeft className="w-8 h-8 text-orange-400" />
              <span className="text-sm text-orange-400 font-semibold">Conversion Rate</span>
            </div>
            <p className="text-3xl font-bold text-white">1000:1</p>
            <p className="text-sm text-gray-400 mt-1">Points to Dollar</p>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Points Conversion */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <ArrowRightLeft className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Convert Points to Cash</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Points to Convert (Minimum: 1000)
                  </label>
                  <Input
                    type="number"
                    value={pointsToConvert}
                    onChange={(e) => setPointsToConvert(e.target.value)}
                    placeholder="Enter points amount"
                    className="bg-slate-800/50 border-slate-700 text-white"
                    min="1000"
                    step="1000"
                  />
                  {pointsToConvert && parseInt(pointsToConvert) >= 1000 && (
                    <p className="text-sm text-green-400 mt-2">
                      You will receive: ${(parseInt(pointsToConvert) / 1000).toFixed(2)}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleConvertPoints}
                  disabled={converting || !pointsToConvert || parseInt(pointsToConvert) < 1000}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 font-semibold"
                >
                  {converting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Converting...
                    </div>
                  ) : (
                    'Convert Points'
                  )}
                </Button>
              </div>

              <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Conversion Info</h3>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• 1000 points = $1.00 USD</li>
                  <li>• Minimum conversion: 1000 points</li>
                  <li>• Instant conversion</li>
                  <li>• No conversion fees</li>
                </ul>
              </div>
            </Card>
          </motion.div>

          {/* Transaction History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <History className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Recent Transactions</h2>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white font-medium">
                            {transaction.transaction_type === 'points_to_cash' ? 'Points Conversion' : transaction.transaction_type}
                          </p>
                          <p className="text-sm text-gray-400">{transaction.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-semibold">
                            ${transaction.amount.toFixed(2)}
                          </p>
                          {transaction.points_amount > 0 && (
                            <p className="text-xs text-gray-400">
                              -{transaction.points_amount} points
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className={`px-2 py-1 rounded-full ${
                          transaction.status === 'completed' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {transaction.status}
                        </span>
                        <span className="text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions yet</p>
                    <p className="text-sm">Start earning points to see your transaction history</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Balance;
