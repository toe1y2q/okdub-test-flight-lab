import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Starfield } from '@/components/Starfield';
import Leaderboard from '@/components/Leaderboard';
import NFTMinter from '@/components/NFTMinter';
import TestingEngine from '@/components/TestingEngine';
import TokenGatedAccess from '@/components/TokenGatedAccess';
import { LogOut, Zap, TrendingUp, Trophy, Palette, Code, Briefcase, Bug, ShoppingBag, Coins } from 'lucide-react';

const Dashboard = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPoints: 0,
    totalTests: 0,
    totalNfts: 0,
    successRate: 0
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
            className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
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

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-3 text-cyan-400">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-xl text-gray-400">Ready to test some blockchain apps?</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Points</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Code className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Tests Completed</p>
                <p className="text-2xl font-bold text-purple-400">{stats.totalTests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.successRate.toFixed(1)}%</p>
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
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => navigate('/projects')}
              className="h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 hover:from-cyan-500/30 hover:to-blue-500/30"
              variant="outline"
            >
              <div className="flex flex-col items-center space-y-2">
                <Briefcase className="w-6 h-6 text-cyan-400" />
                <span className="text-cyan-400">QA Projects</span>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/bounties')}
              className="h-20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 hover:from-yellow-500/30 hover:to-orange-500/30"
              variant="outline"
            >
              <div className="flex flex-col items-center space-y-2">
                <Bug className="w-6 h-6 text-yellow-400" />
                <span className="text-yellow-400">Bug Bounties</span>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/marketplace')}
              className="h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30"
              variant="outline"
            >
              <div className="flex flex-col items-center space-y-2">
                <ShoppingBag className="w-6 h-6 text-purple-400" />
                <span className="text-purple-400">NFT Market</span>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/balance')}
              className="h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30"
              variant="outline"
            >
              <div className="flex flex-col items-center space-y-2">
                <Coins className="w-6 h-6 text-green-400" />
                <span className="text-green-400">Tokens</span>
              </div>
            </Button>
          </div>
        </motion.div>

        {/* Token-Gated Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Token-Gated Access</h2>
          <TokenGatedAccess />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Testing Engine & NFT Minter */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Blockchain Testing</h2>
              <TestingEngine />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create NFT</h2>
              <NFTMinter />
            </motion.div>
          </div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Leaderboard</h2>
            <Leaderboard />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
