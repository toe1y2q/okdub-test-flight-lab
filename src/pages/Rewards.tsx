
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Starfield } from '@/components/Starfield';
import { LogOut, Zap, Trophy, Gift, Star, Target, Flame } from 'lucide-react';

interface UserStats {
  total_tests: number;
  total_nfts: number;
  success_rate: number;
  points: number;
  weekly_points: number;
}

const Rewards = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

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
    try {
      const { data, error } = await supabase
        .from('leaderboard_stats')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserStats(data || { total_tests: 0, total_nfts: 0, success_rate: 100, points: 0, weekly_points: 0 });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoadingStats(false);
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

  const rewards = [
    { name: 'First Test', description: 'Complete your first smart contract test', points: 50, unlocked: (userStats?.total_tests || 0) >= 1, icon: Target },
    { name: 'NFT Creator', description: 'Mint your first NFT', points: 100, unlocked: (userStats?.total_nfts || 0) >= 1, icon: Star },
    { name: 'Test Master', description: 'Complete 10 successful tests', points: 250, unlocked: (userStats?.total_tests || 0) >= 10, icon: Trophy },
    { name: 'NFT Collector', description: 'Mint 5 NFTs', points: 300, unlocked: (userStats?.total_nfts || 0) >= 5, icon: Gift },
    { name: 'Perfectionist', description: 'Achieve 95% success rate', points: 500, unlocked: (userStats?.success_rate || 0) >= 95, icon: Flame },
    { name: 'Weekly Warrior', description: 'Earn 500 points in a week', points: 200, unlocked: (userStats?.weekly_points || 0) >= 500, icon: Zap },
  ];

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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-poppins">
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
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            Dashboard
          </Button>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
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
          <h1 className="text-4xl font-bold mb-3 text-primary">Rewards & Achievements</h1>
          <p className="text-xl text-muted-foreground">Unlock rewards as you test and mint</p>
        </motion.div>

        {/* User Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6 backdrop-blur-xl bg-card/50 border text-center">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{userStats?.points || 0}</p>
            <p className="text-sm text-muted-foreground">Total Points</p>
          </Card>
          <Card className="p-6 backdrop-blur-xl bg-card/50 border text-center">
            <Target className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{userStats?.total_tests || 0}</p>
            <p className="text-sm text-muted-foreground">Tests Completed</p>
          </Card>
          <Card className="p-6 backdrop-blur-xl bg-card/50 border text-center">
            <Star className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{userStats?.total_nfts || 0}</p>
            <p className="text-sm text-muted-foreground">NFTs Minted</p>
          </Card>
          <Card className="p-6 backdrop-blur-xl bg-card/50 border text-center">
            <Flame className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{userStats?.success_rate || 0}%</p>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </Card>
        </motion.div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className={`p-6 backdrop-blur-xl border transition-all duration-300 ${
                reward.unlocked 
                  ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30' 
                  : 'bg-card/50 border-border'
              }`}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    reward.unlocked ? 'bg-primary/20' : 'bg-muted/40'
                  }`}>
                    <reward.icon className={`w-6 h-6 ${
                      reward.unlocked ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{reward.name}</h3>
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold">+{reward.points} points</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    reward.unlocked 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted/40 text-muted-foreground'
                  }`}>
                    {reward.unlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
