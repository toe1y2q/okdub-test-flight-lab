
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Starfield } from '@/components/Starfield';
import { GlassPanel } from '@/components/GlassPanel';
import TestRunner from '@/components/TestRunner';
import NFTMinter from '@/components/NFTMinter';
import Leaderboard from '@/components/Leaderboard';
import { LogOut, Zap, Image, Trophy, Gift, Settings } from 'lucide-react';

const Dashboard = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

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
          <div className="hidden md:flex items-center space-x-2">
            <Button
              onClick={() => navigate('/nfts')}
              variant="outline"
              size="sm"
              className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
            >
              <Image className="w-4 h-4 mr-2" />
              NFTs
            </Button>
            <Button
              onClick={() => navigate('/rewards')}
              variant="outline"
              size="sm"
              className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Rewards
            </Button>
            <Button
              onClick={() => navigate('/settings')}
              variant="outline"
              size="sm"
              className="border-gray-400/30 text-gray-400 hover:bg-gray-400/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
          <span className="text-gray-300 hidden md:block">Welcome, {user?.email}</span>
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
          <h1 className="text-4xl font-bold mb-3 text-cyan-400">Mission Control</h1>
          <p className="text-xl text-gray-400">Your Web3 testing command center</p>
        </motion.div>

        {/* Quick Navigation Cards - Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 md:hidden"
        >
          <Card 
            className="p-4 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/nfts')}
          >
            <div className="flex items-center space-x-3">
              <Image className="w-6 h-6 text-purple-400" />
              <span className="text-white font-medium">NFTs</span>
            </div>
          </Card>
          <Card 
            className="p-4 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-yellow-500/30 transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/rewards')}
          >
            <div className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <span className="text-white font-medium">Rewards</span>
            </div>
          </Card>
          <Card 
            className="p-4 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-gray-500/30 transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/settings')}
          >
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-gray-400" />
              <span className="text-white font-medium">Settings</span>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TestRunner />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <NFTMinter />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Leaderboard />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
