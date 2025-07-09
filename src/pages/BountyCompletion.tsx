
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Starfield } from '@/components/Starfield';
import { LogOut, Zap, CheckCircle, Upload, ExternalLink } from 'lucide-react';
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
}

const BountyCompletion = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [bounty, setBounty] = useState<BugBounty | null>(null);
  const [completion, setCompletion] = useState<BountyCompletion | null>(null);
  const [loadingBounty, setLoadingBounty] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    completion_proof: '',
    completion_url: ''
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchBounty();
      fetchCompletion();
    }
  }, [isAuthenticated, id]);

  const fetchBounty = async () => {
    try {
      const { data, error } = await supabase
        .from('bug_bounties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setBounty(data);
    } catch (error) {
      console.error('Error fetching bounty:', error);
      toast.error('Failed to load bounty details');
      navigate('/bounties');
    } finally {
      setLoadingBounty(false);
    }
  };

  const fetchCompletion = async () => {
    try {
      const { data, error } = await supabase
        .from('bounty_completions')
        .select('*')
        .eq('bounty_id', id)
        .eq('completed_by', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCompletion(data);
      if (data) {
        setFormData({
          completion_proof: data.completion_proof,
          completion_url: data.completion_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching completion:', error);
    }
  };

  const handleSubmitCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !bounty) return;

    if (!formData.completion_proof.trim()) {
      toast.error('Please provide completion proof');
      return;
    }

    setSubmitting(true);
    try {
      if (completion) {
        // Update existing completion
        const { error } = await supabase
          .from('bounty_completions')
          .update({
            completion_proof: formData.completion_proof,
            completion_url: formData.completion_url || null,
            status: 'pending'
          })
          .eq('id', completion.id);

        if (error) throw error;
        toast.success('Completion updated successfully!');
      } else {
        // Create new completion
        const { error } = await supabase
          .from('bounty_completions')
          .insert({
            bounty_id: bounty.id,
            completed_by: user.id,
            completion_proof: formData.completion_proof,
            completion_url: formData.completion_url || null
          });

        if (error) throw error;
        toast.success('Completion submitted successfully!');
      }

      fetchCompletion();
    } catch (error) {
      console.error('Error submitting completion:', error);
      toast.error('Failed to submit completion');
    } finally {
      setSubmitting(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
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

  if (!isAuthenticated || !bounty) {
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
          <h1 className="text-4xl font-bold mb-3 text-green-400">Complete Bounty</h1>
          <p className="text-xl text-gray-400">Submit your solution and claim the reward</p>
        </motion.div>

        {/* Bounty Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">{bounty.title}</h2>
              <div className="flex space-x-2">
                <Badge className={getSeverityColor(bounty.severity)}>
                  {bounty.severity}
                </Badge>
                <Badge className="bg-green-500/20 text-green-400">
                  ${bounty.reward_amount.toFixed(2)}
                </Badge>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4">{bounty.description}</p>
          </Card>
        </motion.div>

        {/* Completion Status */}
        {completion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                  Completion Status
                </h3>
                <Badge className={getStatusColor(completion.status)}>
                  {completion.status}
                </Badge>
              </div>
              
              {completion.review_notes && (
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-400 mb-2">Review Notes:</h4>
                  <p className="text-gray-300">{completion.review_notes}</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Completion Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-blue-400" />
              {completion ? 'Update Completion' : 'Submit Completion'}
            </h3>
            
            <form onSubmit={handleSubmitCompletion} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Completion Proof *
                </label>
                <Textarea
                  value={formData.completion_proof}
                  onChange={(e) => setFormData({ ...formData, completion_proof: e.target.value })}
                  placeholder="Describe how you fixed the bug, what changes were made, testing performed, etc."
                  className="bg-slate-800/50 border-slate-700 text-white"
                  rows={6}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Completion URL (Optional)
                </label>
                <Input
                  value={formData.completion_url}
                  onChange={(e) => setFormData({ ...formData, completion_url: e.target.value })}
                  placeholder="https://github.com/yourrepo/pull/123 or demo link"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Link to pull request, demo, or other relevant proof
                </p>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {submitting ? 'Submitting...' : completion ? 'Update Completion' : 'Submit Completion'}
                </Button>
                
                {formData.completion_url && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open(formData.completion_url, '_blank')}
                    className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Link
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BountyCompletion;
