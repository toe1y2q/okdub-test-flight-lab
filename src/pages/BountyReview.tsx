
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Starfield } from '@/components/Starfield';
import { LogOut, Zap, CheckCircle, XCircle, DollarSign, User, Calendar, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface BugBounty {
  id: string;
  title: string;
  description: string;
  severity: string;
  reward_amount: number;
  status: string;
  submitted_by: string;
}

interface BountyCompletion {
  id: string;
  completion_proof: string;
  completion_url: string | null;
  status: string;
  review_notes: string | null;
  completed_at: string;
  completed_by: string;
}

const BountyReview = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [bounty, setBounty] = useState<BugBounty | null>(null);
  const [completion, setCompletion] = useState<BountyCompletion | null>(null);
  const [loadingBounty, setLoadingBounty] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchBountyAndCompletion();
    }
  }, [isAuthenticated, id]);

  const fetchBountyAndCompletion = async () => {
    try {
      const { data: bountyData, error: bountyError } = await supabase
        .from('bug_bounties')
        .select('*')
        .eq('id', id)
        .eq('submitted_by', user?.id)
        .single();

      if (bountyError) throw bountyError;
      setBounty(bountyData);

      const { data: completionData, error: completionError } = await supabase
        .from('bounty_completions')
        .select('*')
        .eq('bounty_id', id)
        .eq('status', 'pending')
        .single();

      if (completionError && completionError.code !== 'PGRST116') {
        throw completionError;
      }

      setCompletion(completionData);
    } catch (error) {
      console.error('Error fetching bounty/completion:', error);
      toast.error('Failed to load bounty details');
      navigate('/bounties');
    } finally {
      setLoadingBounty(false);
    }
  };

  const handleApproval = async (approved: boolean) => {
    if (!completion || !bounty) return;

    setProcessing(true);
    try {
      // Update completion status
      const { error: completionError } = await supabase
        .from('bounty_completions')
        .update({
          status: approved ? 'approved' : 'rejected',
          review_notes: reviewNotes.trim() || null,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', completion.id);

      if (completionError) throw completionError;

      if (approved) {
        // Update bounty status to closed
        const { error: bountyError } = await supabase
          .from('bug_bounties')
          .update({ status: 'closed' })
          .eq('id', bounty.id);

        if (bountyError) throw bountyError;

        // Get current balance first
        const { data: currentBalance, error: balanceSelectError } = await supabase
          .from('user_balances')
          .select('cash_balance, total_earned')
          .eq('user_id', completion.completed_by)
          .single();

        if (balanceSelectError) throw balanceSelectError;

        // Calculate new balances
        const newCashBalance = (currentBalance.cash_balance || 0) + bounty.reward_amount;
        const newTotalEarned = (currentBalance.total_earned || 0) + bounty.reward_amount;

        // Update balance with calculated values
        const { error: balanceError } = await supabase
          .from('user_balances')
          .update({
            cash_balance: newCashBalance,
            total_earned: newTotalEarned,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', completion.completed_by);

        if (balanceError) throw balanceError;

        // Record transaction
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: completion.completed_by,
            transaction_type: 'bounty_reward',
            amount: bounty.reward_amount,
            status: 'completed',
            description: `Bounty reward for: ${bounty.title}`,
            completed_at: new Date().toISOString()
          });

        if (transactionError) throw transactionError;

        toast.success('Bounty completion approved and payment released!');
      } else {
        toast.success('Bounty completion rejected');
      }

      navigate('/bounties');
    } catch (error) {
      console.error('Error processing approval:', error);
      toast.error('Failed to process approval');
    } finally {
      setProcessing(false);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'critical': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading || loadingBounty) {
    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-poppins flex items-center justify-center">
        <Starfield />
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !bounty || !completion) {
    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-poppins flex items-center justify-center">
        <Starfield />
        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">No Pending Completion Found</h2>
          <p className="text-gray-400 mb-6">This bounty doesn't have any pending completions to review.</p>
          <Button onClick={() => navigate('/bounties')} className="bg-cyan-500 hover:bg-cyan-600">
            Back to Bounties
          </Button>
        </div>
      </div>
    );
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
            onClick={() => navigate('/bounties')}
            variant="outline"
            size="sm"
            className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
          >
            Back to Bounties
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
          <h1 className="text-4xl font-bold mb-3 text-purple-400">Review Bounty Completion</h1>
          <p className="text-xl text-gray-400">Approve or reject the submitted solution</p>
        </motion.div>

        {/* Bounty Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">{bounty.title}</h2>
              <div className="flex space-x-2">
                <Badge className={getSeverityColor(bounty.severity)}>
                  {bounty.severity}
                </Badge>
                <Badge className="bg-green-500/20 text-green-400">
                  <DollarSign className="w-3 h-3 mr-1" />
                  ${bounty.reward_amount.toFixed(2)}
                </Badge>
              </div>
            </div>
            
            <p className="text-gray-300">{bounty.description}</p>
          </Card>
        </motion.div>

        {/* Completion Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-blue-400" />
              Submitted Solution
            </h3>
            
            <div className="space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h4 className="font-semibold text-cyan-400 mb-2">Completion Proof:</h4>
                <p className="text-gray-300 whitespace-pre-wrap">{completion.completion_proof}</p>
              </div>
              
              {completion.completion_url && (
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-cyan-400 mb-2">Related Link:</h4>
                  <a
                    href={completion.completion_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {completion.completion_url}
                  </a>
                </div>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Submitted: {new Date(completion.completed_at).toLocaleString()}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Review Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Review & Decision</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Review Notes (Optional)
                </label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any feedback or notes about the completion..."
                  className="bg-slate-800/50 border-slate-700 text-white"
                  rows={4}
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={() => handleApproval(true)}
                  disabled={processing}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {processing ? 'Processing...' : 'Approve & Release Payment'}
                </Button>
                
                <Button
                  onClick={() => handleApproval(false)}
                  disabled={processing}
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {processing ? 'Processing...' : 'Reject Completion'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BountyReview;
