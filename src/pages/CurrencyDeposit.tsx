import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Starfield } from '@/components/Starfield';
import { LogOut, Zap, ArrowRight, ArrowLeftRight, History, CreditCard, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { FlutterwavePayment } from '@/components/FlutterwavePayment';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';

interface CurrencyDeposit {
  id: string;
  amount_naira: number;
  amount_usd: number;
  exchange_rate: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  deposit_method: string;
}

interface NairaWallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

const CurrencyDeposit = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { wallet, connected, connectWallet } = useSolanaWallet();
  
  const [deposits, setDeposits] = useState<CurrencyDeposit[]>([]);
  const [nairaWallet, setNairaWallet] = useState<NairaWallet | null>(null);
  const [loadingDeposits, setLoadingDeposits] = useState(true);
  const [flutterwaveAmount, setFlutterwaveAmount] = useState('');
  const [solanaAmount, setSolanaAmount] = useState('');
  const [conversionAmount, setConversionAmount] = useState('');
  const [exchangeRate] = useState(1650); // NGN to USD rate
  const [processingDeposit, setProcessingDeposit] = useState(false);
  const [processingConversion, setProcessingConversion] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  const fetchDeposits = async () => {
    try {
      const { data, error } = await supabase
        .from('currency_deposits')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeposits(data || []);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      toast.error('Failed to load deposits');
    } finally {
      setLoadingDeposits(false);
    }
  };

  const fetchNairaWallet = async () => {
    try {
      const { data, error } = await supabase
        .from('naira_wallets')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (!data) {
        // Create naira wallet if it doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from('naira_wallets')
          .insert({
            user_id: user?.id,
            balance: 0
          })
          .select()
          .single();
          
        if (createError) throw createError;
        setNairaWallet(newWallet);
      } else {
        setNairaWallet(data);
      }
    } catch (error) {
      console.error('Error fetching naira wallet:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDeposits();
      fetchNairaWallet();
    }
  }, [isAuthenticated]);

  const handleFlutterwaveSuccess = async (amount: number) => {
    try {
      // Add to naira wallet
      const { error: walletError } = await supabase
        .from('naira_wallets')
        .update({
          balance: (nairaWallet?.balance || 0) + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (walletError) throw walletError;

      // Create deposit record
      const { error: depositError } = await supabase
        .from('currency_deposits')
        .insert({
          user_id: user?.id,
          amount_naira: amount,
          amount_usd: 0,
          exchange_rate: exchangeRate,
          status: 'completed',
          deposit_method: 'flutterwave',
          completed_at: new Date().toISOString()
        });

      if (depositError) throw depositError;

      toast.success(`₦${amount.toLocaleString()} deposited to your Naira wallet!`);
      setFlutterwaveAmount('');
      fetchDeposits();
      fetchNairaWallet();
    } catch (error) {
      console.error('Error processing Flutterwave deposit:', error);
      toast.error('Failed to process deposit');
    }
  };

  const handleSolanaDeposit = async () => {
    if (!solanaAmount || parseFloat(solanaAmount) <= 0) {
      toast.error('Please enter a valid SOL amount');
      return;
    }

    if (!connected) {
      const publicKey = await connectWallet();
      if (!publicKey) return;
    }

    setProcessingDeposit(true);
    try {
      const amount = parseFloat(solanaAmount);
      const usdAmount = amount * 100; // Assuming 1 SOL = $100

      const { error } = await supabase
        .from('currency_deposits')
        .insert({
          user_id: user?.id,
          amount_naira: 0,
          amount_usd: usdAmount,
          exchange_rate: 100,
          status: 'pending',
          deposit_method: 'solana'
        });

      if (error) throw error;

      toast.success('Solana deposit initiated! Please complete the transaction in your wallet.');
      setSolanaAmount('');
      fetchDeposits();
    } catch (error) {
      console.error('Error creating Solana deposit:', error);
      toast.error('Failed to create Solana deposit');
    } finally {
      setProcessingDeposit(false);
    }
  };

  const handleConvertToUSD = async () => {
    if (!conversionAmount || parseFloat(conversionAmount) <= 0) {
      toast.error('Please enter a valid amount to convert');
      return;
    }

    const amount = parseFloat(conversionAmount);
    if (amount > (nairaWallet?.balance || 0)) {
      toast.error('Insufficient Naira balance');
      return;
    }

    setProcessingConversion(true);
    try {
      const usdAmount = amount / exchangeRate;

      // Deduct from naira wallet
      const { error: walletError } = await supabase
        .from('naira_wallets')
        .update({
          balance: (nairaWallet?.balance || 0) - amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (walletError) throw walletError;

      // Create conversion record
      const { error: conversionError } = await supabase
        .from('currency_deposits')
        .insert({
          user_id: user?.id,
          amount_naira: amount,
          amount_usd: usdAmount,
          exchange_rate: exchangeRate,
          status: 'completed',
          deposit_method: 'conversion',
          completed_at: new Date().toISOString()
        });

      if (conversionError) throw conversionError;

      toast.success(`₦${amount.toLocaleString()} converted to $${usdAmount.toFixed(2)} USD!`);
      setConversionAmount('');
      fetchDeposits();
      fetchNairaWallet();
    } catch (error) {
      console.error('Error converting currency:', error);
      toast.error('Failed to convert currency');
    } finally {
      setProcessingConversion(false);
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
          <motion.img
            src="/lovable-uploads/3e7c2c9a-0c07-4a59-afbc-c68bc09a5223.png"
            alt="Okdub Casino"
            className="w-10 h-10"
            animate={{ 
              filter: [
                "drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))",
                "drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))",
                "drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Okdub
          </span>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate('/balance')} variant="outline" size="sm" className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10">
            Back to Balance
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
          <h1 className="text-4xl font-bold mb-3 text-cyan-400">Currency Management</h1>
          <p className="text-xl text-gray-400">Deposit funds and manage your currency wallets</p>
          
          {nairaWallet && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
              <p className="text-lg font-semibold text-green-400">
                Naira Wallet Balance: ₦{nairaWallet.balance.toLocaleString()}
              </p>
            </div>
          )}
        </motion.div>

        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="deposit">Deposit Funds</TabsTrigger>
            <TabsTrigger value="convert">Convert to USD</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Flutterwave Deposit (Naira) */}
              <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-400" />
                  Flutterwave (Naira)
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="flutterwave_amount" className="text-white">Amount (₦)</Label>
                    <Input
                      id="flutterwave_amount"
                      type="number"
                      value={flutterwaveAmount}
                      onChange={(e) => setFlutterwaveAmount(e.target.value)}
                      placeholder="Enter amount in Naira"
                      className="bg-slate-800/50 border-gray-600 text-white"
                      min="0"
                      step="100"
                    />
                  </div>

                  <div className="bg-slate-800/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-300">Pay with card, bank transfer, or mobile money</p>
                    <p className="text-xs text-gray-400 mt-2">Funds will be added to your Naira wallet</p>
                  </div>

                  {flutterwaveAmount && parseFloat(flutterwaveAmount) > 0 ? (
                    <FlutterwavePayment
                      amount={parseFloat(flutterwaveAmount)}
                      currency="NGN"
                      email={user?.email || ''}
                      onSuccess={() => handleFlutterwaveSuccess(parseFloat(flutterwaveAmount))}
                      onError={() => toast.error('Deposit failed')}
                    />
                  ) : (
                    <Button disabled className="w-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-50">
                      Enter amount to continue
                    </Button>
                  )}
                </div>
              </Card>

              {/* Solana Deposit */}
              <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Wallet className="w-5 h-5 mr-2 text-purple-400" />
                  Solana Deposit
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="solana_amount" className="text-white">Amount (SOL)</Label>
                    <Input
                      id="solana_amount"
                      type="number"
                      value={solanaAmount}
                      onChange={(e) => setSolanaAmount(e.target.value)}
                      placeholder="Enter SOL amount"
                      className="bg-slate-800/50 border-gray-600 text-white"
                      min="0"
                      step="0.1"
                    />
                    {solanaAmount && (
                      <p className="text-sm text-gray-400 mt-2">
                        Equivalent: ${(parseFloat(solanaAmount) * 100).toFixed(2)} USD
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-800/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-300">
                      {connected ? `Connected: ${wallet?.publicKey?.toString().slice(0, 8)}...` : 'Connect your Solana wallet'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Direct USD deposit via Solana</p>
                  </div>

                  <Button
                    onClick={handleSolanaDeposit}
                    disabled={processingDeposit || !solanaAmount}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  >
                    {processingDeposit ? 'Processing...' : connected ? 'Deposit SOL' : 'Connect & Deposit'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="convert">
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <ArrowLeftRight className="w-5 h-5 mr-2 text-blue-400" />
                Convert Naira to USD
              </h3>
              
              <div className="space-y-4">
                {nairaWallet && nairaWallet.balance > 0 ? (
                  <>
                    <div>
                      <Label htmlFor="conversion_amount" className="text-white">Amount to Convert (₦)</Label>
                      <Input
                        id="conversion_amount"
                        type="number"
                        value={conversionAmount}
                        onChange={(e) => setConversionAmount(e.target.value)}
                        placeholder="Enter Naira amount"
                        className="bg-slate-800/50 border-gray-600 text-white"
                        min="0"
                        max={nairaWallet.balance}
                        step="100"
                      />
                      {conversionAmount && (
                        <p className="text-sm text-gray-400 mt-2">
                          Will receive: ${(parseFloat(conversionAmount) / exchangeRate).toFixed(2)} USD
                        </p>
                      )}
                    </div>

                    <div className="bg-slate-800/30 p-4 rounded-lg">
                      <p className="text-sm text-gray-300">
                        Available Balance: ₦{nairaWallet.balance.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Exchange Rate: ₦{exchangeRate}/USD
                      </p>
                    </div>

                    <Button
                      onClick={handleConvertToUSD}
                      disabled={processingConversion || !conversionAmount || parseFloat(conversionAmount) <= 0}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      {processingConversion ? 'Converting...' : 'Convert to USD'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No Naira balance available for conversion</p>
                    <p className="text-sm text-gray-500 mt-2">Deposit funds first to convert to USD</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <History className="w-5 h-5 mr-2 text-purple-400" />
                Transaction History
              </h3>
              
              {loadingDeposits ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                </div>
              ) : deposits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No deposits yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deposits.map((deposit) => (
                    <div key={deposit.id} className="bg-slate-800/30 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {deposit.deposit_method === 'flutterwave' && (
                              <CreditCard className="w-4 h-4 text-blue-400" />
                            )}
                            {deposit.deposit_method === 'solana' && (
                              <Wallet className="w-4 h-4 text-purple-400" />
                            )}
                            {deposit.deposit_method === 'conversion' && (
                              <ArrowLeftRight className="w-4 h-4 text-yellow-400" />
                            )}
                            <p className="font-semibold text-white capitalize">
                              {deposit.deposit_method.replace('_', ' ')}
                            </p>
                          </div>
                          {deposit.amount_naira > 0 && (
                            <p className="text-white">₦{deposit.amount_naira.toLocaleString()}</p>
                          )}
                          {deposit.amount_usd > 0 && (
                            <p className="text-sm text-gray-400">${deposit.amount_usd.toFixed(2)} USD</p>
                          )}
                          <p className="text-xs text-gray-400">
                            {new Date(deposit.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              deposit.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {deposit.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CurrencyDeposit;
