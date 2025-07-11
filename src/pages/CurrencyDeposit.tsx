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
import { LogOut, Zap, ArrowRight, DollarSign, ArrowLeftRight, History, CreditCard, Wallet } from 'lucide-react';
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
const CurrencyDeposit = () => {
  const {
    user,
    loading,
    signOut,
    isAuthenticated
  } = useAuth();
  const navigate = useNavigate();
  const {
    wallet,
    connected,
    connectWallet
  } = useSolanaWallet();
  const [deposits, setDeposits] = useState<CurrencyDeposit[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState(true);
  const [nairaAmount, setNairaAmount] = useState('');
  const [flutterwaveAmount, setFlutterwaveAmount] = useState('');
  const [solanaAmount, setSolanaAmount] = useState('');
  const [exchangeRate] = useState(1650); // NGN to USD rate
  const [processingDeposit, setProcessingDeposit] = useState(false);
  const [processingConversion, setProcessingConversion] = useState(false);
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);
  useEffect(() => {
    if (isAuthenticated) {
      fetchDeposits();
    }
  }, [isAuthenticated]);
  const fetchDeposits = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('currency_deposits').select('*').eq('user_id', user?.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setDeposits(data || []);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      toast.error('Failed to load deposits');
    } finally {
      setLoadingDeposits(false);
    }
  };
  const handleNairaDeposit = async () => {
    if (!nairaAmount || parseFloat(nairaAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setProcessingDeposit(true);
    try {
      const amount = parseFloat(nairaAmount);
      const usdAmount = amount / exchangeRate;
      const {
        error
      } = await supabase.from('currency_deposits').insert({
        user_id: user?.id,
        amount_naira: amount,
        amount_usd: usdAmount,
        exchange_rate: exchangeRate,
        status: 'pending',
        deposit_method: 'bank_transfer'
      });
      if (error) throw error;
      toast.success('Deposit request submitted! Please transfer funds to complete.');
      setNairaAmount('');
      fetchDeposits();
    } catch (error) {
      console.error('Error creating deposit:', error);
      toast.error('Failed to create deposit request');
    } finally {
      setProcessingDeposit(false);
    }
  };
  const handleFlutterwaveDeposit = async () => {
    if (!flutterwaveAmount || parseFloat(flutterwaveAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setProcessingDeposit(true);
    try {
      const amount = parseFloat(flutterwaveAmount);
      const {
        error
      } = await supabase.from('currency_deposits').insert({
        user_id: user?.id,
        amount_naira: 0,
        // Flutterwave handles USD directly
        amount_usd: amount,
        exchange_rate: 1,
        // 1:1 for USD
        status: 'pending',
        deposit_method: 'flutterwave'
      });
      if (error) throw error;
      toast.success('Flutterwave deposit initiated!');
      setFlutterwaveAmount('');
      fetchDeposits();
    } catch (error) {
      console.error('Error creating Flutterwave deposit:', error);
      toast.error('Failed to create Flutterwave deposit');
    } finally {
      setProcessingDeposit(false);
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
      const usdAmount = amount * 100; // Assuming 1 SOL = $100 (this should be dynamic)

      const {
        error
      } = await supabase.from('currency_deposits').insert({
        user_id: user?.id,
        amount_naira: 0,
        amount_usd: usdAmount,
        exchange_rate: 100,
        // SOL to USD rate
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
  const handleConvertToUSD = async (depositId: string) => {
    setProcessingConversion(true);
    try {
      const {
        error
      } = await supabase.from('currency_deposits').update({
        status: 'completed',
        completed_at: new Date().toISOString()
      }).eq('id', depositId);
      if (error) throw error;
      toast.success('Successfully converted to USD!');
      fetchDeposits();
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
      
      <motion.nav initial={{
      y: -100,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} transition={{
      duration: 0.8
    }} className="relative z-10 flex justify-between items-center p-6 backdrop-blur-sm">
        <motion.div whileHover={{
        scale: 1.05
      }} className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <motion.div animate={{
          rotate: 360
        }} transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }} className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </motion.div>
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
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="mb-8">
          <h1 className="text-4xl font-bold mb-3 text-cyan-400">Currency Management</h1>
          <p className="text-xl text-gray-400">Deposit using Bank Transfer, Flutterwave, or Solana</p>
        </motion.div>

        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="deposit">Deposit Funds</TabsTrigger>
            <TabsTrigger value="convert">Convert to USD</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit">
            <div className="grid gap-6 md:grid-cols-3 py-0 my-[5px] mx-[5px] px-[41px]">
              {/* Bank Transfer Deposit */}
              

              {/* Flutterwave Deposit */}
              <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-400" />
                  Flutterwave (USD)
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="flutterwave_amount" className="text-white">Amount (USD)</Label>
                    <Input id="flutterwave_amount" type="number" value={flutterwaveAmount} onChange={e => setFlutterwaveAmount(e.target.value)} placeholder="Enter amount in USD" className="bg-slate-800/50 border-gray-600 text-white" min="0" step="1" />
                  </div>

                  <div className="bg-slate-800/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-300">Pay with card, bank transfer, or mobile money</p>
                    <p className="text-xs text-gray-400 mt-2">Secure payment powered by Flutterwave</p>
                  </div>

                  {flutterwaveAmount && parseFloat(flutterwaveAmount) > 0 ? <FlutterwavePayment amount={parseFloat(flutterwaveAmount)} email={user?.email || ''} onSuccess={() => {
                  toast.success('Deposit successful!');
                  setFlutterwaveAmount('');
                  fetchDeposits();
                }} onError={() => {
                  toast.error('Deposit failed');
                }} /> : <Button disabled className="w-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-50">
                      Enter amount to continue
                    </Button>}
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
                    <Input id="solana_amount" type="number" value={solanaAmount} onChange={e => setSolanaAmount(e.target.value)} placeholder="Enter SOL amount" className="bg-slate-800/50 border-gray-600 text-white" min="0" step="0.1" />
                    {solanaAmount && <p className="text-sm text-gray-400 mt-2">
                        Equivalent: ${(parseFloat(solanaAmount) * 100).toFixed(2)} USD
                      </p>}
                  </div>

                  <div className="bg-slate-800/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-300">
                      {connected ? `Connected: ${wallet?.publicKey?.toString().slice(0, 8)}...` : 'Connect your Solana wallet'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Fast and decentralized deposits</p>
                  </div>

                  <Button onClick={handleSolanaDeposit} disabled={processingDeposit || !solanaAmount} className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
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
                Convert to USD
              </h3>
              
              <div className="space-y-4">
                {deposits.filter(d => d.status === 'pending').length === 0 ? <div className="text-center py-8">
                    <p className="text-gray-400">No pending deposits to convert</p>
                  </div> : deposits.filter(d => d.status === 'pending').map(deposit => <div key={deposit.id} className="bg-slate-800/30 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <p className="font-semibold text-white">₦{deposit.amount_naira.toLocaleString()}</p>
                            <p className="text-sm text-gray-400">
                              Converts to ${deposit.amount_usd.toFixed(2)} USD
                            </p>
                          </div>
                          <Button onClick={() => handleConvertToUSD(deposit.id)} disabled={processingConversion} className="bg-blue-500 hover:bg-blue-600">
                            Convert
                          </Button>
                        </div>
                        <p className="text-xs text-gray-400">
                          Rate: ₦{deposit.exchange_rate}/USD
                        </p>
                      </div>)}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <History className="w-5 h-5 mr-2 text-purple-400" />
                Transaction History
              </h3>
              
              {loadingDeposits ? <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                </div> : deposits.length === 0 ? <div className="text-center py-8">
                  <p className="text-gray-400">No deposits yet</p>
                </div> : <div className="space-y-4">
                  {deposits.map(deposit => <div key={deposit.id} className="bg-slate-800/30 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {deposit.deposit_method === 'flutterwave' && <CreditCard className="w-4 h-4 text-blue-400" />}
                            {deposit.deposit_method === 'solana' && <Wallet className="w-4 h-4 text-purple-400" />}
                            {deposit.deposit_method === 'bank_transfer' && <DollarSign className="w-4 h-4 text-green-400" />}
                            <p className="font-semibold text-white capitalize">{deposit.deposit_method.replace('_', ' ')}</p>
                          </div>
                          {deposit.amount_naira > 0 && <p className="text-white">₦{deposit.amount_naira.toLocaleString()}</p>}
                          <p className="text-sm text-gray-400">${deposit.amount_usd.toFixed(2)} USD</p>
                          <p className="text-xs text-gray-400">
                            {new Date(deposit.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs ${deposit.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {deposit.status}
                          </span>
                        </div>
                      </div>
                    </div>)}
                </div>}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default CurrencyDeposit;