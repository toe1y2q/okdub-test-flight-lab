
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Starfield } from '@/components/Starfield';
import { LogOut, Zap, Pickaxe, Clock, Coins, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface MiningSession {
  id: string;
  started_at: string;
  last_claim_at: string;
  total_mined: number;
  is_active: boolean;
}

const Mining = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [miningSession, setMiningSession] = useState<MiningSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [pendingReward, setPendingReward] = useState(0);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState(0);
  const [claiming, setClaiming] = useState(false);

  const TOKENS_PER_DAY = 0.05;
  const TOKENS_PER_HOUR = TOKENS_PER_DAY / 24;
  const CLAIM_INTERVAL_HOURS = 1; // Can claim every hour

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMiningSession();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (miningSession && miningSession.is_active) {
        calculatePendingReward();
        calculateTimeUntilNextClaim();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [miningSession]);

  const fetchMiningSession = async () => {
    try {
      const { data, error } = await supabase
        .from('mining_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setMiningSession(data);
      
      if (data) {
        calculatePendingReward();
        calculateTimeUntilNextClaim();
      }
    } catch (error) {
      console.error('Error fetching mining session:', error);
      toast.error('Failed to load mining session');
    } finally {
      setLoadingSession(false);
    }
  };

  const calculatePendingReward = () => {
    if (!miningSession) return;

    const now = new Date();
    const lastClaim = new Date(miningSession.last_claim_at);
    const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
    
    const pending = Math.min(hoursSinceLastClaim * TOKENS_PER_HOUR, TOKENS_PER_HOUR * CLAIM_INTERVAL_HOURS);
    setPendingReward(Math.max(0, pending));
  };

  const calculateTimeUntilNextClaim = () => {
    if (!miningSession) return;

    const now = new Date();
    const lastClaim = new Date(miningSession.last_claim_at);
    const nextClaimTime = new Date(lastClaim.getTime() + (CLAIM_INTERVAL_HOURS * 60 * 60 * 1000));
    
    const timeUntilNext = Math.max(0, nextClaimTime.getTime() - now.getTime());
    setTimeUntilNextClaim(timeUntilNext);
  };

  const startMining = async () => {
    try {
      // Check for existing active session to prevent duplicates
      const { data: existing, error: checkError } = await supabase
        .from('mining_sessions')
        .select('id')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .maybeSingle();

      if (checkError) throw checkError;
      
      if (existing) {
        toast.info('You already have an active mining session!');
        fetchMiningSession();
        return;
      }

      const { error } = await supabase
        .from('mining_sessions')
        .insert({
          user_id: user?.id,
          started_at: new Date().toISOString(),
          last_claim_at: new Date().toISOString(),
          total_mined: 0,
          is_active: true
        });

      if (error) throw error;

      toast.success('Mining started! You can claim rewards every hour.');
      fetchMiningSession();
    } catch (error) {
      console.error('Error starting mining:', error);
      toast.error('Failed to start mining');
    }
  };

  const claimReward = async () => {
    if (!miningSession || pendingReward <= 0 || timeUntilNextClaim > 0) return;

    setClaiming(true);
    try {
      // Update mining session
      const { error: miningError } = await supabase
        .from('mining_sessions')
        .update({
          last_claim_at: new Date().toISOString(),
          total_mined: miningSession.total_mined + pendingReward
        })
        .eq('id', miningSession.id);

      if (miningError) throw miningError;

      // Update or create user tokens
      const { data: existingTokens, error: fetchError } = await supabase
        .from('okdub_tokens')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingTokens) {
        const { error: updateError } = await supabase
          .from('okdub_tokens')
          .update({
            token_amount: (existingTokens.token_amount || 0) + pendingReward,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user?.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('okdub_tokens')
          .insert({
            user_id: user?.id,
            token_amount: pendingReward,
            staked_amount: 0
          });

        if (insertError) throw insertError;
      }

      toast.success(`Claimed ${pendingReward.toFixed(6)} OKDUB tokens!`);
      fetchMiningSession();
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward');
    } finally {
      setClaiming(false);
    }
  };

  const stopMining = async () => {
    if (!miningSession) return;

    try {
      const { error } = await supabase
        .from('mining_sessions')
        .update({ is_active: false })
        .eq('id', miningSession.id);

      if (error) throw error;

      toast.success('Mining stopped');
      setMiningSession(null);
    } catch (error) {
      console.error('Error stopping mining:', error);
      toast.error('Failed to stop mining');
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

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading || loadingSession) {
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
            onClick={() => navigate('/balance')}
            variant="outline"
            size="sm"
            className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
          >
            Back to Balance
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

      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-3 text-yellow-400">OKDUB Mining</h1>
          <p className="text-xl text-gray-400">Mine 0.05 OKDUB tokens per day</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mining Status */}
          <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Pickaxe className="w-5 h-5 mr-2 text-yellow-400" />
              Mining Status
            </h3>
            
            {!miningSession ? (
              <div className="text-center py-8">
                <Pickaxe className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400 mb-6">Start mining to earn OKDUB tokens</p>
                <Button
                  onClick={startMining}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  Start Mining
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-green-400 font-semibold">● Mining Active</span>
                  <Button
                    onClick={stopMining}
                    variant="outline"
                    size="sm"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    Stop Mining
                  </Button>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Total Mined</span>
                    <span className="text-white font-semibold">{miningSession.total_mined.toFixed(6)} OKDUB</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Mining Rate</span>
                    <span className="text-white font-semibold">{TOKENS_PER_HOUR.toFixed(6)} OKDUB/hour</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Started</span>
                    <span className="text-white">{new Date(miningSession.started_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Claim Rewards */}
          <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Coins className="w-5 h-5 mr-2 text-green-400" />
              Claim Rewards
            </h3>
            
            {!miningSession ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Start mining to see rewards</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-300">Available to Claim</span>
                    <span className="text-2xl font-bold text-green-400">
                      {pendingReward.toFixed(6)} OKDUB
                    </span>
                  </div>
                  
                  {timeUntilNextClaim > 0 ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="w-4 h-4 mr-2 text-yellow-400" />
                        <span className="text-yellow-400">Next claim in: {formatTime(timeUntilNextClaim)}</span>
                      </div>
                      <Progress 
                        value={((CLAIM_INTERVAL_HOURS * 60 * 60 * 1000 - timeUntilNextClaim) / (CLAIM_INTERVAL_HOURS * 60 * 60 * 1000)) * 100} 
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <Button
                      onClick={claimReward}
                      disabled={claiming || pendingReward <= 0}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      {claiming ? 'Claiming...' : `Claim ${pendingReward.toFixed(6)} OKDUB`}
                    </Button>
                  )}
                </div>

                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Mining Stats
                  </h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Daily Rate:</span>
                      <span className="text-white">{TOKENS_PER_DAY} OKDUB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hourly Rate:</span>
                      <span className="text-white">{TOKENS_PER_HOUR.toFixed(6)} OKDUB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Claim Interval:</span>
                      <span className="text-white">{CLAIM_INTERVAL_HOURS} hour</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Mining;
