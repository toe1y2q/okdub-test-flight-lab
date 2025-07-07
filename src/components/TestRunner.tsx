
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Rocket, Zap, Shield, Activity } from 'lucide-react';

const TestRunner = () => {
  const [testType, setTestType] = useState('token_transfer');
  const [network, setNetwork] = useState('sepolia');
  const [isRunning, setIsRunning] = useState(false);
  const [testData, setTestData] = useState({
    recipient: '',
    amount: '',
    gasLimit: '21000',
    gasPrice: '20',
    data: ''
  });

  const testTypes = [
    { value: 'token_transfer', label: 'Token Transfer', icon: Zap },
    { value: 'smart_contract', label: 'Smart Contract Call', icon: Shield },
    { value: 'nft_mint', label: 'NFT Minting', icon: Rocket },
    { value: 'defi_swap', label: 'DeFi Swap', icon: Activity }
  ];

  const networks = [
    { value: 'sepolia', label: 'Sepolia Testnet' },
    { value: 'goerli', label: 'Goerli Testnet' },
    { value: 'polygon_mumbai', label: 'Polygon Mumbai' },
    { value: 'arbitrum_goerli', label: 'Arbitrum Goerli' }
  ];

  const runTest = async () => {
    setIsRunning(true);
    
    try {
      // Insert test run record
      const { data, error } = await supabase
        .from('test_runs')
        .insert({
          test_type: testType,
          network,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Simulate test execution
      toast.success('Test initiated! Monitoring blockchain...');
      
      // Simulate processing time
      setTimeout(async () => {
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        const mockGasUsed = Math.floor(Math.random() * 50000) + 21000;
        const mockBlockNumber = Math.floor(Math.random() * 1000000) + 18000000;
        
        // Update test run with results
        await supabase
          .from('test_runs')
          .update({
            status: 'completed',
            tx_hash: mockTxHash,
            gas_used: mockGasUsed,
            block_number: mockBlockNumber,
            completed_at: new Date().toISOString()
          })
          .eq('id', data.id);

        // Update leaderboard stats
        await supabase.rpc('increment_test_stats');

        toast.success(`Test completed! Tx: ${mockTxHash.substring(0, 10)}...`);
        setIsRunning(false);
      }, 3000);

    } catch (error: any) {
      console.error('Test error:', error);
      toast.error('Test failed: ' + error.message);
      setIsRunning(false);
    }
  };

  const selectedTestType = testTypes.find(t => t.value === testType);

  return (
    <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
      <div className="flex items-center space-x-3 mb-6">
        {selectedTestType && <selectedTestType.icon className="w-6 h-6 text-cyan-400" />}
        <h3 className="text-2xl font-bold text-cyan-400">Blockchain Test Runner</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Test Type</label>
          <Select value={testType} onValueChange={setTestType}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {testTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center space-x-2">
                    <type.icon className="w-4 h-4" />
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Network</label>
          <Select value={network} onValueChange={setNetwork}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {networks.map((net) => (
                <SelectItem key={net.value} value={net.value}>
                  {net.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {testType === 'token_transfer' && (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Recipient Address</label>
              <Input
                value={testData.recipient}
                onChange={(e) => setTestData(prev => ({ ...prev, recipient: e.target.value }))}
                placeholder="0x..."
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount (ETH)</label>
              <Input
                value={testData.amount}
                onChange={(e) => setTestData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.001"
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gas Limit</label>
              <Input
                value={testData.gasLimit}
                onChange={(e) => setTestData(prev => ({ ...prev, gasLimit: e.target.value }))}
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gas Price (Gwei)</label>
              <Input
                value={testData.gasPrice}
                onChange={(e) => setTestData(prev => ({ ...prev, gasPrice: e.target.value }))}
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>
        </div>
      )}

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={runTest}
          disabled={isRunning}
          className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 font-semibold py-3"
        >
          {isRunning ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Running Test...
            </div>
          ) : (
            <div className="flex items-center">
              <Rocket className="w-4 h-4 mr-2" />
              Launch Test Sequence
            </div>
          )}
        </Button>
      </motion.div>
    </Card>
  );
};

export default TestRunner;
