import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Starfield } from '@/components/Starfield';
import { 
  LogOut, 
  Coins, 
  Trophy, 
  Zap, 
  Code, 
  Palette, 
  TrendingUp, 
  Gamepad2,
  ShoppingCart,
  CreditCard,
  Wallet,
  PlusCircle,
  Award,
  Target,
  Sparkles,
  Rocket,
  Star
} from 'lucide-react';

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
          <Button onClick={() => navigate('/balance')} variant="outline" size="sm" className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10">
            <Wallet className="w-4 h-4 mr-2" />
            Balance
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
          <h1 className="text-4xl font-bold mb-3 text-cyan-400">Welcome to Okdub Casino</h1>
          <p className="text-xl text-gray-400">Explore our exciting features and start playing!</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-slate-800/50 backdrop-blur-md border border-slate-700 hover:border-cyan-400 transition-colors duration-300 cursor-pointer" onClick={() => navigate('/balance')}>
              <div className="flex items-center space-x-3">
                <Wallet className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-semibold text-white">Balance</h2>
              </div>
              <p className="text-gray-400 mt-2">View your wallet balance and transaction history</p>
            </Card>
          </motion.div>

          {/* Currency Deposit Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-slate-800/50 backdrop-blur-md border border-slate-700 hover:border-green-500 transition-colors duration-300 cursor-pointer" onClick={() => navigate('/currency-deposit')}>
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-green-500" />
                <h2 className="text-2xl font-semibold text-white">Currency Deposit</h2>
              </div>
              <p className="text-gray-400 mt-2">Deposit funds into your account</p>
            </Card>
          </motion.div>

          {/* Leaderboard Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-slate-800/50 backdrop-blur-md border border-slate-700 hover:border-yellow-500 transition-colors duration-300 cursor-pointer">
              <div className="flex items-center space-x-3">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-semibold text-white">Leaderboard</h2>
              </div>
              <p className="text-gray-400 mt-2">Compete with other players and climb the ranks</p>
            </Card>
          </motion.div>

          {/* Games Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-slate-800/50 backdrop-blur-md border border-slate-700 hover:border-purple-500 transition-colors duration-300 cursor-pointer">
              <div className="flex items-center space-x-3">
                <Gamepad2 className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl font-semibold text-white">Games</h2>
              </div>
              <p className="text-gray-400 mt-2">Explore our collection of exciting games</p>
            </Card>
          </motion.div>

          {/* NFT Marketplace Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="bg-slate-800/50 backdrop-blur-md border border-slate-700 hover:border-pink-500 transition-colors duration-300 cursor-pointer">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-semibold text-white">NFT Marketplace</h2>
              </div>
              <p className="text-gray-400 mt-2">Buy, sell, and discover unique NFTs</p>
            </Card>
          </motion.div>

          {/* Staking Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="bg-slate-800/50 backdrop-blur-md border border-slate-700 hover:border-orange-500 transition-colors duration-300 cursor-pointer">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl font-semibold text-white">Staking</h2>
              </div>
              <p className="text-gray-400 mt-2">Stake your tokens and earn rewards</p>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
