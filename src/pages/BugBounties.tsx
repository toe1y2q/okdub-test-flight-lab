
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Starfield } from '@/components/Starfield';
import { LogOut, Zap, Plus, Bug, DollarSign, Clock, User, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface BugBounty {
  id: string;
  title: string;
  description: string;
  severity: string;
  reward_amount: number;
  status: string;
  created_at: string;
  project_id: string;
  submitted_by?: string;
  claimed_by?: string;
}

interface Project {
  id: string;
  name: string;
}

const BugBounties = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bounties, setBounties] = useState<BugBounty[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingBounties, setLoadingBounties] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    reward_amount: 0,
    project_id: searchParams.get('project') || ''
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBounties();
      fetchProjects();
    }
  }, [isAuthenticated]);

  const fetchBounties = async () => {
    try {
      const { data, error } = await supabase
        .from('bug_bounties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBounties(data || []);
    } catch (error) {
      console.error('Error fetching bounties:', error);
      toast.error('Failed to load bug bounties');
    } finally {
      setLoadingBounties(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('status', 'active');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleCreateBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bug_bounties')
        .insert([{
          ...formData,
          submitted_by: user.id
        }]);

      if (error) throw error;

      toast.success('Bug bounty created successfully!');
      setShowCreateForm(false);
      setFormData({ title: '', description: '', severity: 'medium', reward_amount: 0, project_id: '' });
      fetchBounties();
    } catch (error) {
      console.error('Error creating bounty:', error);
      toast.error('Failed to create bug bounty');
    }
  };

  const handleClaimBounty = async (bountyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bug_bounties')
        .update({ 
          claimed_by: user.id,
          status: 'claimed'
        })
        .eq('id', bountyId)
        .eq('status', 'open');

      if (error) throw error;

      toast.success('Bug bounty claimed successfully!');
      fetchBounties();
    } catch (error) {
      console.error('Error claiming bounty:', error);
      toast.error('Failed to claim bug bounty');
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
      case 'open': return 'bg-green-500/20 text-green-400';
      case 'claimed': return 'bg-blue-500/20 text-blue-400';
      case 'closed': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
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
            Dashboard
          </Button>
          <Button
            onClick={() => navigate('/projects')}
            variant="outline"
            size="sm"
            className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
          >
            Projects
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

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold mb-3 text-yellow-400">Bug Bounties</h1>
            <p className="text-xl text-gray-400">Find and fix bugs, earn rewards</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Bounty
          </Button>
        </motion.div>

        {/* Create Bounty Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-yellow-400">Create New Bug Bounty</h3>
              <form onSubmit={handleCreateBounty} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter bounty title"
                    className="bg-slate-800/50 border-slate-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the bug or issue in detail"
                    className="bg-slate-800/50 border-slate-700 text-white"
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project</label>
                    <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Severity</label>
                    <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Reward (USD)</label>
                    <Input
                      type="number"
                      value={formData.reward_amount}
                      onChange={(e) => setFormData({ ...formData, reward_amount: parseFloat(e.target.value) || 0 })}
                      placeholder="Reward amount"
                      className="bg-slate-800/50 border-slate-700 text-white"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                  >
                    Create Bounty
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="border-gray-600 text-gray-400 hover:bg-gray-600/10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {/* Bounties Grid */}
        {loadingBounties ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 animate-pulse">
                <div className="h-4 bg-slate-800/50 rounded mb-4"></div>
                <div className="h-3 bg-slate-800/50 rounded mb-2"></div>
                <div className="h-3 bg-slate-800/50 rounded"></div>
              </Card>
            ))}
          </div>
        ) : bounties.length === 0 ? (
          <Card className="p-12 backdrop-blur-xl bg-white/5 border border-white/10 text-center">
            <Bug className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Bug Bounties Found</h3>
            <p className="text-gray-400 mb-6">Start by creating your first bug bounty!</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
            >
              Create Bounty
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bounties.map((bounty, index) => (
              <motion.div
                key={bounty.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-yellow-500/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white truncate flex-1 mr-2">{bounty.title}</h3>
                    <Badge className={getStatusColor(bounty.status)}>
                      {bounty.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-4 line-clamp-3">{bounty.description}</p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <Badge className={getSeverityColor(bounty.severity)}>
                          {bounty.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-semibold">${bounty.reward_amount.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400">
                        {new Date(bounty.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {bounty.status === 'open' && (
                    <Button
                      onClick={() => handleClaimBounty(bounty.id)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      size="sm"
                    >
                      Claim Bounty
                    </Button>
                  )}

                  {bounty.status === 'claimed' && bounty.claimed_by === user?.id && (
                    <div className="text-center text-blue-400 text-sm">
                      <User className="w-4 h-4 inline mr-1" />
                      Claimed by you
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BugBounties;
