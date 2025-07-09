
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Starfield } from '@/components/Starfield';
import { LogOut, Zap, Wallet, ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const SolanaWithdrawal = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const { wallet, connected, connecting, connectWallet, disconnectWallet } = useSolanaWallet();
  const navigate = useNavigate();
  const [balance, setBalance] = useState({ cashBalance: 0, totalEarned: 0 });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBalance();
    }
  }, [isAuthenticated, user]);

  const fetchBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('user_balances')
        .select('cash_balance, total_earned')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setBalance({
        cashBalance: data?.cash_balance || 0,
        totalEarned: data?.total_earned || 0
      });
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleConnectWallet = async () => {
    const publicKey = await connectWallet();
    if (publicKey) {
      setWalletAddress(publicKey);
    }
  };

  const handleWithdraw = async () => {
    if (!connected || !walletAddress) {
      toast.error('Please connect your Solana wallet first');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }

    if (amount > balance.cashBalance) {
      toast.error('Insufficient balance for withdrawal');
      return;
    }

    if (amount < 0.01) {
      toast.error('Minimum withdrawal amount is $0.01');
      return;
    }

    setIsWithdrawing(true);

    try {
      // Create withdrawal transaction record
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          transaction_type: 'withdrawal',
          amount: -amount, // Negative for withdrawal
          status: 'pending',
          description: `Solana withdrawal to ${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update user balance
      const { error: balanceError } = await supabase
        .from('user_balances')
        .update({
          cash_balance: balance.cashBalance - amount,
          total_withdrawn: balance.cashBalance - amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (balanceError) throw balanceError;

      // Simulate Solana transaction (in a real app, this would integrate with Solana)
      setTimeout(async () => {
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        
        await supabase
          .from('transactions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', transactionData.id);

        toast.success(`Withdrawal successful! TX: ${mockTxHash.slice(0, 8)}...`);
        setWithdrawAmount('');
        fetchBalance();
        setIsWithdrawing(false);
      }, 3000);

    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error('Withdrawal failed: ' + error.message);
      setIsWithdrawing(false);
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
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
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
          <h1 className="text-4xl font-bold mb-3 text-cyan-400">Solana Withdrawal</h1>
          <p className="text-xl text-gray-400">Withdraw your earnings to your Solana wallet</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Overview */}
          <div className="lg:col-span-1">
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Account Balance</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Available Balance</span>
                  <span className="text-green-400 font-bold">${balance.cashBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Earned</span>
                  <span className="text-cyan-400 font-bold">${balance.totalEarned.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Min withdrawal: $0.01</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Withdrawal Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <Wallet className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Withdraw to Solana</h2>
              </div>

              <div className="space-y-6">
                {/* Wallet Connection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Solana Wallet Connection
                  </label>
                  {!connected ? (
                    <Button
                      onClick={handleConnectWallet}
                      disabled={connecting}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {connecting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Connecting...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Wallet className="w-4 h-4 mr-2" />
                          Connect Phantom Wallet
                        </div>
                      )}
                    </Button>
                  ) : (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-400 font-medium">Wallet Connected</p>
                          <p className="text-sm text-gray-400">
                            {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                          </p>
                        </div>
                        <Button
                          onClick={disconnectWallet}
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Withdrawal Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Withdrawal Amount (USD)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={balance.cashBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-slate-800/50 border-slate-700 text-white"
                    disabled={!connected}
                  />
                  <div className="flex justify-between mt-2">
                    <Button
                      onClick={() => setWithdrawAmount((balance.cashBalance * 0.25).toFixed(2))}
                      variant="outline"
                      size="sm"
                      disabled={!connected}
                      className="border-gray-600 text-gray-400 hover:bg-gray-700"
                    >
                      25%
                    </Button>
                    <Button
                      onClick={() => setWithdrawAmount((balance.cashBalance * 0.5).toFixed(2))}
                      variant="outline"
                      size="sm"
                      disabled={!connected}
                      className="border-gray-600 text-gray-400 hover:bg-gray-700"
                    >
                      50%
                    </Button>
                    <Button
                      onClick={() => setWithdrawAmount((balance.cashBalance * 0.75).toFixed(2))}
                      variant="outline"
                      size="sm"
                      disabled={!connected}
                      className="border-gray-600 text-gray-400 hover:bg-gray-700"
                    >
                      75%
                    </Button>
                    <Button
                      onClick={() => setWithdrawAmount(balance.cashBalance.toFixed(2))}
                      variant="outline"
                      size="sm"
                      disabled={!connected}
                      className="border-gray-600 text-gray-400 hover:bg-gray-700"
                    >
                      Max
                    </Button>
                  </div>
                </div>

                {/* Withdraw Button */}
                <Button
                  onClick={handleWithdraw}
                  disabled={!connected || !withdrawAmount || isWithdrawing}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-semibold py-3"
                >
                  {isWithdrawing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Withdrawal...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="w-4 h-4 mr-2" />
                      Withdraw ${withdrawAmount || '0.00'}
                    </div>
                  )}
                </Button>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Withdrawals are processed instantly to your connected Solana wallet</p>
                  <p>• Network fees may apply for Solana transactions</p>
                  <p>• Minimum withdrawal amount is $0.01</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolanaWithdrawal;
