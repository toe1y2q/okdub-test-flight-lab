import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Starfield } from '@/components/Starfield';
import Leaderboard from '@/components/Leaderboard';
import ImprovedNFTMinter from '@/components/ImprovedNFTMinter';
import TestingEngine from '@/components/TestingEngine';
import TokenGatedAccess from '@/components/TokenGatedAccess';
import { LogOut, Zap, TrendingUp, Trophy, Palette, Code, Briefcase, Bug, ShoppingBag, Coins, DollarSign, Wallet, ArrowUpRight } from 'lucide-react';

const Dashboard = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPoints: 0,
    totalTests: 0,
    totalNfts: 0,
    successRate: 0
  });
  const [balance, setBalance] = useState({
    cashBalance: 0,
    totalEarned: 0
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserStats();
    }
  }, [isAuthenticated, user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Fetch from leaderboard_stats
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('leaderboard_stats')
        .select('points, total_tests, total_nfts, success_rate')
        .eq('user_id', user.id)
        .single();

      if (leaderboardError) throw leaderboardError;

      setStats({
        totalPoints: leaderboardData?.points || 0,
        totalTests: leaderboardData?.total_tests || 0,
        totalNfts: leaderboardData?.total_nfts || 0,
        successRate: leaderboardData?.success_rate || 0
      });

      // Fetch balance data
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_balances')
        .select('cash_balance, total_earned')
        .eq('user_id', user.id)
        .single();

      if (balanceError && balanceError.code !== 'PGRST116') throw balanceError;

      setBalance({
        cashBalance: balanceData?.cash_balance || 0,
        totalEarned: balanceData?.total_earned || 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
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
          className="flex items-center space-x-3"
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
            onClick={() => navigate('/pricing')}
            variant="outline"
            size="sm"
            className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
          >
            Pricing
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

      {/* Main Content */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-3">
            Welcome back, <span className="text-cyan-400">{user?.email?.split('@')[0]}</span>!
          </h1>
          <p className="text-xl text-gray-400">Your blockchain testing and NFT creation dashboard</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8"
        >
          <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Points</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.points.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Tests Run</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.totalTests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-pink-500/30 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-pink-500/20 rounded-lg">
                <Palette className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">NFTs Minted</p>
                <p className="text-2xl font-bold text-pink-400">{stats.totalNfts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Code className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-purple-400">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/balance')}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">Cash Balance</p>
                <p className="text-2xl font-bold text-green-400">${balance.cashBalance.toFixed(2)}</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Card>

          <Card 
            className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/withdrawal')}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">Total Earned</p>
                <p className="text-2xl font-bold text-emerald-400">${balance.totalEarned.toFixed(2)}</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Card>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <Card 
            className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/nft-creator')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">NFT Creator</h3>
                <p className="text-gray-400 text-sm">Create and mint your digital assets</p>
              </div>
              <Palette className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </Card>

          <Card 
            className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/bounties')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Bug Bounties</h3>
                <p className="text-gray-400 text-sm">Find and report bugs for rewards</p>
              </div>
              <Bug className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
          </Card>

          <Card 
            className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-pink-500/30 transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/marketplace')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Marketplace</h3>
                <p className="text-gray-400 text-sm">Buy and sell NFTs</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-pink-400 group-hover:scale-110 transition-transform" />
            </div>
          </Card>

          <Card 
            className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-yellow-500/30 transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/projects')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Projects</h3>
                <p className="text-gray-400 text-sm">Manage your blockchain projects</p>
              </div>
              <Briefcase className="w-8 h-8 text-yellow-400 group-hover:scale-110 transition-transform" />
            </div>
          </Card>

          <Card 
            className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/withdrawal')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Withdraw Funds</h3>
                <p className="text-gray-400 text-sm">Transfer earnings to Solana wallet</p>
              </div>
              <Wallet className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
            </div>
          </Card>

          <Card 
            className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/rewards')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Rewards</h3>
                <p className="text-gray-400 text-sm">Convert points to cash</p>
              </div>
              <Coins className="w-8 h-8 text-orange-400 group-hover:scale-110 transition-transform" />
            </div>
          </Card>
        </motion.div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* NFT Minting */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ImprovedNFTMinter />
          </motion.div>

          {/* Testing Engine */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <TestingEngine />
          </motion.div>
        </div>

        {/* Token Gated Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <TokenGatedAccess />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
