
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Play, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';

const TestingEngine = () => {
  const { user } = useAuth();
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [selectedTestType, setSelectedTestType] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const networks = [
    { value: 'ethereum', label: 'Ethereum Mainnet' },
    { value: 'sepolia', label: 'Sepolia Testnet' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'arbitrum', label: 'Arbitrum' },
    { value: 'optimism', label: 'Optimism' }
  ];

  const testTypes = [
    { value: 'smart_contract', label: 'Smart Contract Test' },
    { value: 'transaction', label: 'Transaction Test' },
    { value: 'gas_optimization', label: 'Gas Optimization' },
    { value: 'security_audit', label: 'Security Audit' },
    { value: 'performance', label: 'Performance Test' }
  ];

  const awardPointsForTest = async (userId: string, success: boolean) => {
    try {
      const pointsToAward = success ? 50 : 25; // More points for successful tests

      // Update leaderboard stats
      const { data: currentStats, error: fetchError } = await supabase
        .from('leaderboard_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching current stats:', fetchError);
        return;
      }

      const successRate = currentStats.total_tests > 0 
        ? ((currentStats.total_tests * currentStats.success_rate / 100 + (success ? 1 : 0)) / (currentStats.total_tests + 1)) * 100
        : success ? 100 : 0;

      const { error: updateError } = await supabase
        .from('leaderboard_stats')
        .update({
          total_tests: currentStats.total_tests + 1,
          points: currentStats.points + pointsToAward,
          weekly_points: currentStats.weekly_points + pointsToAward,
          success_rate: successRate,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating stats:', updateError);
        return;
      }

      // Record the points transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          transaction_type: 'earned_points',
          amount: 0,
          points_amount: pointsToAward,
          status: 'completed',
          description: `Earned ${pointsToAward} points for ${success ? 'successful' : 'failed'} test run`,
          completed_at: new Date().toISOString()
        });

      if (transactionError) {
        console.error('Error recording transaction:', transactionError);
      } else {
        toast.success(`+${pointsToAward} points earned for test completion!`);
      }
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

  const runTest = async () => {
    if (!user) {
      toast.error('Please sign in to run tests');
      return;
    }

    if (!selectedNetwork || !selectedTestType) {
      toast.error('Please select both network and test type');
      return;
    }

    setIsRunning(true);
    
    try {
      // Create test run record
      const { data, error } = await supabase
        .from('test_runs')
        .insert({
          user_id: user.id,
          network: selectedNetwork,
          test_type: selectedTestType,
          status: 'running'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Test started successfully!');

      // Simulate test execution
      setTimeout(async () => {
        const success = Math.random() > 0.3; // 70% success rate
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        const mockGasUsed = Math.floor(Math.random() * 50000) + 21000;
        const mockBlockNumber = Math.floor(Math.random() * 1000000) + 18000000;

        await supabase
          .from('test_runs')
          .update({
            status: success ? 'completed' : 'failed',
            tx_hash: success ? mockTxHash : null,
            gas_used: success ? mockGasUsed : null,
            block_number: success ? mockBlockNumber : null,
            completed_at: new Date().toISOString()
          })
          .eq('id', data.id);

        // Award points for test completion
        await awardPointsForTest(user.id, success);

        if (success) {
          toast.success(`Test completed successfully! TX: ${mockTxHash.substring(0, 10)}...`);
        } else {
          toast.error('Test failed. Please check your configuration and try again.');
        }

        setIsRunning(false);
      }, 3000 + Math.random() * 2000); // 3-5 seconds

    } catch (error: any) {
      console.error('Test error:', error);
      toast.error('Test failed: ' + error.message);
      setIsRunning(false);
    }
  };

  return (
    <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
      <div className="flex items-center space-x-3 mb-6">
        <Zap className="w-6 h-6 text-cyan-400" />
        <h3 className="text-2xl font-bold text-cyan-400">Testing Engine</h3>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Network</label>
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {networks.map((network) => (
                  <SelectItem key={network.value} value={network.value}>
                    {network.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Test Type</label>
            <Select value={selectedTestType} onValueChange={setSelectedTestType}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="Select test type" />
              </SelectTrigger>
              <SelectContent>
                {testTypes.map((test) => (
                  <SelectItem key={test.value} value={test.value}>
                    {test.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={runTest}
            disabled={isRunning || !selectedNetwork || !selectedTestType}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-semibold py-3"
          >
            {isRunning ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Running Test...
              </div>
            ) : (
              <div className="flex items-center">
                <Play className="w-4 h-4 mr-2" />
                Run Test (+50 points)
              </div>
            )}
          </Button>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700/50">
          <div className="text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300">Success</p>
            <p className="text-xs text-gray-400">+50 points</p>
          </div>
          <div className="text-center">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300">Failed</p>
            <p className="text-xs text-gray-400">+25 points</p>
          </div>
          <div className="text-center">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300">Running</p>
            <p className="text-xs text-gray-400">In progress</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TestingEngine;
