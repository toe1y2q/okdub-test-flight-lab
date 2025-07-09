
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Crown, Zap, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';

interface TokenBalance {
  token_amount: number;
  staked_amount: number;
}

interface SubscriptionTier {
  id: string;
  name: string;
  required_tokens: number;
  features: {
    max_tests_per_day: number;
    sandbox_access: boolean;
    priority_support: boolean;
    private_rpc?: boolean;
  };
}

const TokenGatedAccess = () => {
  const { user, isAuthenticated } = useAuth();
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([]);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTokenBalance();
      fetchSubscriptionTiers();
    }
  }, [isAuthenticated]);

  const fetchTokenBalance = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('okdub_tokens')
        .select('token_amount, staked_amount')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setTokenBalance(data);
    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
  };

  const fetchSubscriptionTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('required_tokens', { ascending: true });

      if (error) throw error;
      setSubscriptionTiers(data || []);
      
      // Determine current tier
      if (tokenBalance && data) {
        const availableTokens = tokenBalance.token_amount + tokenBalance.staked_amount;
        const eligibleTiers = data.filter(tier => availableTokens >= tier.required_tokens);
        const highestTier = eligibleTiers[eligibleTiers.length - 1];
        setCurrentTier(highestTier || data[0]);
      }
    } catch (error) {
      console.error('Error fetching subscription tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStakeTokens = async (amount: number) => {
    if (!user || !tokenBalance) return;

    if (amount > tokenBalance.token_amount) {
      toast.error('Insufficient token balance');
      return;
    }

    try {
      const { error } = await supabase
        .from('okdub_tokens')
        .update({
          token_amount: tokenBalance.token_amount - amount,
          staked_amount: tokenBalance.staked_amount + amount
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(`Successfully staked ${amount} OKDUB tokens!`);
      fetchTokenBalance();
    } catch (error) {
      console.error('Error staking tokens:', error);
      toast.error('Failed to stake tokens');
    }
  };

  const handleUnstakeTokens = async (amount: number) => {
    if (!user || !tokenBalance) return;

    if (amount > tokenBalance.staked_amount) {
      toast.error('Insufficient staked balance');
      return;
    }

    try {
      const { error } = await supabase
        .from('okdub_tokens')
        .update({
          token_amount: tokenBalance.token_amount + amount,
          staked_amount: tokenBalance.staked_amount - amount
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(`Successfully unstaked ${amount} OKDUB tokens!`);
      fetchTokenBalance();
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      toast.error('Failed to unstake tokens');
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'free': return 'bg-gray-500/20 text-gray-400';
      case 'bronze': return 'bg-orange-500/20 text-orange-400';
      case 'silver': return 'bg-slate-500/20 text-slate-400';
      case 'gold': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-purple-500/20 text-purple-400';
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'gold': return <Crown className="w-5 h-5" />;
      case 'silver': return <Zap className="w-5 h-5" />;
      case 'bronze': return <Coins className="w-5 h-5" />;
      default: return <Lock className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 animate-pulse">
        <div className="h-4 bg-slate-800/50 rounded mb-4"></div>
        <div className="h-3 bg-slate-800/50 rounded mb-2"></div>
        <div className="h-3 bg-slate-800/50 rounded"></div>
      </Card>
    );
  }

  const totalTokens = tokenBalance ? tokenBalance.token_amount + tokenBalance.staked_amount : 0;

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Token-Gated Access</h3>
          {currentTier && (
            <Badge className={getTierColor(currentTier.name)}>
              {getTierIcon(currentTier.name)}
              <span className="ml-2">{currentTier.name}</span>
            </Badge>
          )}
        </div>

        {tokenBalance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{tokenBalance.token_amount.toFixed(2)}</div>
              <div className="text-sm text-gray-400">Available Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{tokenBalance.staked_amount.toFixed(2)}</div>
              <div className="text-sm text-gray-400">Staked Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{totalTokens.toFixed(2)}</div>
              <div className="text-sm text-gray-400">Total Tokens</div>
            </div>
          </div>
        )}

        {currentTier && (
          <div className="bg-slate-800/30 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">Current Tier Benefits</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-300">{currentTier.features.max_tests_per_day} tests/day</span>
              </div>
              <div className="flex items-center space-x-2">
                {currentTier.features.sandbox_access ? 
                  <Unlock className="w-4 h-4 text-green-400" /> : 
                  <Lock className="w-4 h-4 text-red-400" />
                }
                <span className="text-gray-300">Sandbox Access</span>
              </div>
              <div className="flex items-center space-x-2">
                {currentTier.features.priority_support ? 
                  <Unlock className="w-4 h-4 text-green-400" /> : 
                  <Lock className="w-4 h-4 text-red-400" />
                }
                <span className="text-gray-300">Priority Support</span>
              </div>
              <div className="flex items-center space-x-2">
                {currentTier.features.private_rpc ? 
                  <Unlock className="w-4 h-4 text-green-400" /> : 
                  <Lock className="w-4 h-4 text-red-400" />
                }
                <span className="text-gray-300">Private RPC</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Subscription Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {subscriptionTiers.map((tier) => {
          const isCurrentTier = currentTier?.id === tier.id;
          const canUpgrade = totalTokens >= tier.required_tokens;
          
          return (
            <Card 
              key={tier.id} 
              className={`p-4 backdrop-blur-xl border transition-all duration-300 ${
                isCurrentTier 
                  ? 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30' 
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-center mb-4">
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getTierColor(tier.name)}`}>
                  {getTierIcon(tier.name)}
                  <span>{tier.name}</span>
                </div>
                <div className="text-2xl font-bold text-white mt-2">
                  {tier.required_tokens} OKDUB
                </div>
                <div className="text-sm text-gray-400">Required to unlock</div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Tests per day:</span>
                  <span className="text-white">{tier.features.max_tests_per_day}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Sandbox:</span>
                  <span className={tier.features.sandbox_access ? 'text-green-400' : 'text-red-400'}>
                    {tier.features.sandbox_access ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Priority Support:</span>
                  <span className={tier.features.priority_support ? 'text-green-400' : 'text-red-400'}>
                    {tier.features.priority_support ? 'Yes' : 'No'}
                  </span>
                </div>
                {tier.features.private_rpc !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Private RPC:</span>
                    <span className={tier.features.private_rpc ? 'text-green-400' : 'text-red-400'}>
                      {tier.features.private_rpc ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
              </div>

              {isCurrentTier && (
                <div className="mt-4 text-center">
                  <Badge className="bg-green-500/20 text-green-400">Current Tier</Badge>
                </div>
              )}

              {!isCurrentTier && !canUpgrade && (
                <div className="mt-4 text-center">
                  <Badge className="bg-red-500/20 text-red-400">
                    Need {(tier.required_tokens - totalTokens).toFixed(0)} more tokens
                  </Badge>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Staking Actions */}
      {tokenBalance && (
        <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Token Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-lg font-semibold text-cyan-400 mb-2">Stake Tokens</h4>
              <p className="text-sm text-gray-400 mb-4">
                Stake tokens to maintain your tier status and unlock premium features.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => handleStakeTokens(100)}
                  disabled={tokenBalance.token_amount < 100}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  size="sm"
                >
                  Stake 100 OKDUB
                </Button>
                <Button
                  onClick={() => handleStakeTokens(500)}
                  disabled={tokenBalance.token_amount < 500}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                  size="sm"
                >
                  Stake 500 OKDUB
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-yellow-400 mb-2">Unstake Tokens</h4>
              <p className="text-sm text-gray-400 mb-4">
                Unstake tokens to make them available for other uses.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => handleUnstakeTokens(100)}
                  disabled={tokenBalance.staked_amount < 100}
                  variant="outline"
                  className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                  size="sm"
                >
                  Unstake 100 OKDUB
                </Button>
                <Button
                  onClick={() => handleUnstakeTokens(tokenBalance.staked_amount)}
                  disabled={tokenBalance.staked_amount === 0}
                  variant="outline"
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                  size="sm"
                >
                  Unstake All
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TokenGatedAccess;
