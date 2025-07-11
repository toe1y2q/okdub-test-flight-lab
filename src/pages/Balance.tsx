import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Starfield } from '@/components/Starfield';
import { LogOut, Zap, DollarSign, TrendingUp, History, ArrowRightLeft, Coins, Lock, Unlock, Wallet, Pickaxe, ArrowUpRight } from 'lucide-react';
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
interface OkdubTokens {
  token_amount: number;
  staked_amount: number;
}
const Balance = () => {
  const {
    user,
    loading,
    signOut,
    isAuthenticated
  } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [okdubTokens, setOkdubTokens] = useState<OkdubTokens | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [pointsToConvert, setPointsToConvert] = useState<string>('');
  const [tokensToStake, setTokensToStake] = useState<string>('');
  const [tokensToUnstake, setTokensToUnstake] = useState<string>('');
  const [converting, setConverting] = useState(false);
  const [stakingAction, setStakingAction] = useState<'stake' | 'unstake' | null>(null);
  const [showStaking, setShowStaking] = useState(false);
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
      fetchOkdubTokens();
    }
  }, [isAuthenticated, user]);
  const fetchBalance = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('user_balances').select('*').eq('user_id', user?.id).single();
      if (error && error.code !== 'PGRST116') throw error;
      setBalance(data || {
        points_balance: 0,
        cash_balance: 0,
        total_earned: 0,
        total_withdrawn: 0
      });
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };
  const fetchStats = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('leaderboard_stats').select('*').eq('user_id', user?.id).single();
      if (error && error.code !== 'PGRST116') throw error;
      setStats(data || {
        points: 0,
        weekly_points: 0,
        total_nfts: 0,
        total_tests: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  const fetchTransactions = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('transactions').select('*').eq('user_id', user?.id).order('created_at', {
        ascending: false
      }).limit(10);
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };
  const fetchOkdubTokens = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('okdub_tokens').select('*').eq('user_id', user?.id).single();
      if (error && error.code !== 'PGRST116') throw error;
      setOkdubTokens(data || {
        token_amount: 0,
        staked_amount: 0
      });
    } catch (error) {
      console.error('Error fetching OKDUB tokens:', error);
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
      const {
        error
      } = await supabase.rpc('convert_points_to_cash', {
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
  const handleStakeTokens = async () => {
    const tokens = parseFloat(tokensToStake);
    if (!tokens || tokens <= 0) {
      toast.error('Please enter a valid amount to stake');
      return;
    }
    if (tokens > (okdubTokens?.token_amount || 0)) {
      toast.error('Insufficient tokens to stake');
      return;
    }
    setStakingAction('stake');
    try {
      const {
        error
      } = await supabase.from('okdub_tokens').update({
        token_amount: (okdubTokens?.token_amount || 0) - tokens,
        staked_amount: (okdubTokens?.staked_amount || 0) + tokens,
        updated_at: new Date().toISOString()
      }).eq('user_id', user?.id);
      if (error) throw error;
      toast.success(`Successfully staked ${tokens} OKDUB tokens!`);
      setTokensToStake('');
      fetchOkdubTokens();
    } catch (error: any) {
      console.error('Error staking tokens:', error);
      toast.error('Failed to stake tokens');
    } finally {
      setStakingAction(null);
    }
  };
  const handleUnstakeTokens = async () => {
    const tokens = parseFloat(tokensToUnstake);
    if (!tokens || tokens <= 0) {
      toast.error('Please enter a valid amount to unstake');
      return;
    }
    if (tokens > (okdubTokens?.staked_amount || 0)) {
      toast.error('Insufficient staked tokens to unstake');
      return;
    }
    setStakingAction('unstake');
    try {
      const {
        error
      } = await supabase.from('okdub_tokens').update({
        token_amount: (okdubTokens?.token_amount || 0) + tokens,
        staked_amount: (okdubTokens?.staked_amount || 0) - tokens,
        updated_at: new Date().toISOString()
      }).eq('user_id', user?.id);
      if (error) throw error;
      toast.success(`Successfully unstaked ${tokens} OKDUB tokens!`);
      setTokensToUnstake('');
      fetchOkdubTokens();
    } catch (error: any) {
      console.error('Error unstaking tokens:', error);
      toast.error('Failed to unstake tokens');
    } finally {
      setStakingAction(null);
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
    return <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-poppins flex items-center justify-center">
        <Starfield />
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
        </div>
      </div>;
  }
  if (!isAuthenticated) {
    return null;
  }
  return <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-poppins">
      <Starfield />
      
      {/* Navigation */}
      <motion.nav initial={{
      y: -100,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} transition={{
      duration: 0.8
    }} className="relative z-10 flex justify-between items-center p-4 sm:p-6 backdrop-blur-sm">
        <motion.div whileHover={{
        scale: 1.05
      }} className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <motion.div animate={{
          rotate: 360
        }} transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }} className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </motion.div>
          <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Okdub
          </span>
        </motion.div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button onClick={() => navigate('/nfts')} variant="outline" size="sm" className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10 text-xs sm:text-sm px-2 sm:px-4">
            My NFTs
          </Button>
          <Button onClick={() => navigate('/pricing')} variant="outline" size="sm" className="border-green-400/30 text-green-400 hover:bg-green-400/10 text-xs sm:text-sm px-2 sm:px-4">
            Pricing
          </Button>
          <Button onClick={handleSignOut} variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs sm:text-sm px-2 sm:px-4">
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </motion.nav>

      <div className="relative z-10 p-4 sm:p-6 max-w-6xl mx-auto">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 text-cyan-400">Balance & Wallet</h1>
          <p className="text-lg sm:text-xl text-gray-400">Manage your funds and tokens</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6,
        delay: 0.1
      }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button onClick={() => navigate('/currency-deposit')} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 p-3 sm:p-4 h-auto flex-col space-y-1 sm:space-y-2">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs sm:text-sm font-semibold">Deposit</span>
          </Button>
          
          <Button onClick={() => navigate('/mining')} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 p-3 sm:p-4 h-auto flex-col space-y-1 sm:space-y-2">
            <Pickaxe className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs sm:text-sm font-semibold">Mine</span>
          </Button>
          
          <Button onClick={() => navigate('/withdrawal')} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-3 sm:p-4 h-auto flex-col space-y-1 sm:space-y-2">
            <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs sm:text-sm font-semibold">Withdraw</span>
          </Button>

          <Button onClick={() => setShowStaking(true)} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 p-3 sm:p-4 h-auto flex-col space-y-1 sm:space-y-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs sm:text-sm font-semibold">Stake</span>
          </Button>
        </motion.div>

        {/* Balance Cards */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6 backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 bg-gray-950">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
              <span className="text-xs sm:text-sm text-cyan-400 font-semibold">Points</span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-white">{stats?.points || 0}</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Available</p>
          </Card>

          <Card className="p-4 sm:p-6 backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 bg-zinc-950">
            <div className="flex items-center justify-between mb-2 sm:mb-4 bg-transparent">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              <span className="text-xs sm:text-sm text-green-400 font-semibold">Cash</span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-white">${(balance?.cash_balance || 0).toFixed(2)}</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Balance</p>
          </Card>

          <Card className="p-4 sm:p-6 backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 bg-zinc-950">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              <span className="text-xs sm:text-sm text-purple-400 font-semibold">Earned</span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-white">${(balance?.total_earned || 0).toFixed(2)}</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Total</p>
          </Card>

          <Card className="p-4 sm:p-6 backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/30 bg-zinc-950">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
              <span className="text-xs sm:text-sm text-orange-400 font-semibold">OKDUB</span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-white">{(okdubTokens?.token_amount || 0).toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Tokens</p>
          </Card>

          <Card className="p-4 sm:p-6 backdrop-blur-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/30 bg-zinc-950">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
              <span className="text-xs sm:text-sm text-indigo-400 font-semibold">Staked</span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-white">{(okdubTokens?.staked_amount || 0).toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">OKDUB</p>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Points Conversion */}
          <motion.div initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.4
        }}>
            <Card className="p-4 sm:p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                <h2 className="text-lg sm:text-2xl font-bold text-white">Convert Points</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Points (Min: 1000)
                  </label>
                  <Input type="number" value={pointsToConvert} onChange={e => setPointsToConvert(e.target.value)} placeholder="Enter points" className="bg-slate-800/50 border-slate-700 text-white text-sm" min="1000" step="1000" />
                  {pointsToConvert && parseInt(pointsToConvert) >= 1000 && <p className="text-sm text-green-400 mt-2">
                      You will receive: ${(parseInt(pointsToConvert) / 1000).toFixed(2)}
                    </p>}
                </div>

                <Button onClick={handleConvertPoints} disabled={converting || !pointsToConvert || parseInt(pointsToConvert) < 1000} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 font-semibold text-sm">
                  {converting ? 'Converting...' : 'Convert Points'}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* OKDUB Token Wallet */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.6
        }}>
            <Card className="p-4 sm:p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                <h2 className="text-lg sm:text-2xl font-bold text-white">OKDUB Wallet</h2>
              </div>

              <div className="space-y-4">
                {/* Stake Tokens */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stake Tokens
                  </label>
                  <Input type="number" value={tokensToStake} onChange={e => setTokensToStake(e.target.value)} placeholder="Amount to stake" className="bg-slate-800/50 border-slate-700 text-white text-sm" min="0" max={okdubTokens?.token_amount || 0} />
                  <Button onClick={handleStakeTokens} disabled={stakingAction === 'stake' || !tokensToStake} className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold text-sm">
                    {stakingAction === 'stake' ? <div className="flex items-center">
                        <Lock className="w-4 h-4 mr-2" />
                        Staking...
                      </div> : <div className="flex items-center">
                        <Lock className="w-4 h-4 mr-2" />
                        Stake Tokens
                      </div>}
                  </Button>
                </div>

                {/* Unstake Tokens */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Unstake Tokens
                  </label>
                  <Input type="number" value={tokensToUnstake} onChange={e => setTokensToUnstake(e.target.value)} placeholder="Amount to unstake" className="bg-slate-800/50 border-slate-700 text-white text-sm" min="0" max={okdubTokens?.staked_amount || 0} />
                  <Button onClick={handleUnstakeTokens} disabled={stakingAction === 'unstake' || !tokensToUnstake} className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 font-semibold text-sm">
                    {stakingAction === 'unstake' ? <div className="flex items-center">
                        <Unlock className="w-4 h-4 mr-2" />
                        Unstaking...
                      </div> : <div className="flex items-center">
                        <Unlock className="w-4 h-4 mr-2" />
                        Unstake Tokens
                      </div>}
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Staking Benefits</h3>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Earn rewards while staked</li>
                    <li>• Access premium features</li>
                    <li>• Token-gated NFT access</li>
                    <li>• Governance voting rights</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Transaction History */}
          <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.8
        }}>
            <Card className="p-4 sm:p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <History className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                <h2 className="text-lg sm:text-2xl font-bold text-white">Recent Transactions</h2>
              </div>

              <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                {transactions.length > 0 ? transactions.map(transaction => <div key={transaction.id} className="p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white font-medium text-sm">
                            {transaction.transaction_type === 'points_to_cash' ? 'Points Conversion' : transaction.transaction_type}
                          </p>
                          <p className="text-xs text-gray-400">{transaction.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-semibold text-sm">
                            ${transaction.amount.toFixed(2)}
                          </p>
                          {transaction.points_amount > 0 && <p className="text-xs text-gray-400">
                              -{transaction.points_amount} points
                            </p>}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className={`px-2 py-1 rounded-full ${transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {transaction.status}
                        </span>
                        <span className="text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>) : <div className="text-center py-8 text-gray-400">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions yet</p>
                    <p className="text-sm">Start earning points to see your transaction history</p>
                  </div>}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>;
};
export default Balance;