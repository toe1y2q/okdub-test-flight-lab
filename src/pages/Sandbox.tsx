
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Starfield } from '@/components/Starfield';
import { ArrowLeft, CreditCard, Pickaxe, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface MockTransaction {
  id: string;
  type: 'payment' | 'mining';
  status: 'success' | 'failed';
  amount: number;
  timestamp: string;
}

const Sandbox = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<MockTransaction[]>([]);
  const [isMining, setIsMining] = useState(false);
  const [minedTokens, setMinedTokens] = useState(0);

  const handleTestPayment = () => {
    const success = Math.random() > 0.2;
    const tx: MockTransaction = {
      id: `TEST-${Date.now()}`,
      type: 'payment',
      status: success ? 'success' : 'failed',
      amount: 1000,
      timestamp: new Date().toISOString(),
    };
    setTransactions(prev => [tx, ...prev]);
    toast[success ? 'success' : 'error'](
      success ? 'Test payment successful!' : 'Test payment failed (simulated)'
    );
  };

  const handleTestMining = () => {
    if (isMining) return;
    setIsMining(true);
    setTimeout(() => {
      const amount = 0.05;
      setMinedTokens(prev => prev + amount);
      const tx: MockTransaction = {
        id: `MINE-${Date.now()}`,
        type: 'mining',
        status: 'success',
        amount,
        timestamp: new Date().toISOString(),
      };
      setTransactions(prev => [tx, ...prev]);
      setIsMining(false);
      toast.success(`Mined ${amount} OKDUB (test)`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-poppins">
      <Starfield />
      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6 text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">Testnet Sandbox</h1>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-sm">
            <AlertTriangle className="w-3 h-3 mr-1" /> TESTNET MODE
          </Badge>
        </div>
        <p className="text-gray-400 mb-8">Test payments and mining without using real money. No data is written to your real account.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Test Payment */}
          <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold">Test Payment</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">Simulates a ₦1,000 Flutterwave payment. 80% chance of success.</p>
            <Button onClick={handleTestPayment} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <CreditCard className="w-4 h-4 mr-2" /> Run Test Payment
            </Button>
          </Card>

          {/* Test Mining */}
          <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <Pickaxe className="w-6 h-6 text-orange-400" />
              <h2 className="text-xl font-bold">Test Mining</h2>
            </div>
            <p className="text-gray-400 text-sm mb-2">Simulates claiming 0.05 OKDUB tokens.</p>
            <p className="text-cyan-400 font-bold mb-4">Test Mined: {minedTokens.toFixed(2)} OKDUB</p>
            <Button
              onClick={handleTestMining}
              disabled={isMining}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Pickaxe className="w-4 h-4 mr-2" />
              {isMining ? 'Mining...' : 'Claim Test Tokens'}
            </Button>
          </Card>
        </div>

        {/* Transaction Log */}
        <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
          <h2 className="text-xl font-bold mb-4">Transaction Log</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No test transactions yet. Try a test above!</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center space-x-3">
                    {tx.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{tx.type === 'payment' ? 'Payment' : 'Mining Claim'}</p>
                      <p className="text-xs text-gray-500">{tx.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'payment' ? `₦${tx.amount}` : `${tx.amount} OKDUB`}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Sandbox;
