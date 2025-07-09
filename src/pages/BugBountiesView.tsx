
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Starfield } from '@/components/Starfield';
import { LogOut, Zap, Search, Bug, DollarSign, Clock, User, AlertTriangle, Target } from 'lucide-react';
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

const BugBountiesView = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bounties, setBounties] = useState<BugBounty[]>([]);
  const [projects, setProjects] = useState<{ [key: string]: Project }>({});
  const [loadingBounties, setLoadingBounties] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBounties, setFilteredBounties] = useState<BugBounty[]>([]);

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

  useEffect(() => {
    if (searchTerm) {
      const filtered = bounties.filter(bounty =>
        bounty.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bounty.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bounty.severity.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBounties(filtered);
    } else {
      setFilteredBounties(bounties);
    }
  }, [searchTerm, bounties]);

  const fetchBounties = async () => {
    try {
      const { data, error } = await supabase
        .from('bug_bounties')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBounties(data || []);
      setFilteredBounties(data || []);
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
      
      const projectsMap: { [key: string]: Project } = {};
      data?.forEach(project => {
        projectsMap[project.id] = project;
      });
      setProjects(projectsMap);
    } catch (error) {
      console.error('Error fetching projects:', error);
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
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
            onClick={() => navigate('/marketplace')}
            variant="outline"
            size="sm"
            className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
          >
            Marketplace
          </Button>
          <Button
            onClick={() => navigate('/projects')}
            variant="outline"
            size="sm"
            className="border-green-400/30 text-green-400 hover:bg-green-400/10"
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
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-3 text-yellow-400">Bug Bounties</h1>
          <p className="text-xl text-gray-400">Find open bug bounties and earn rewards by helping fix issues</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bounties..."
              className="pl-10 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
        </motion.div>

        {/* Bounties Grid */}
        {loadingBounties ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400"></div>
          </div>
        ) : filteredBounties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Bug className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No Open Bounties Found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'No bug bounties are currently available'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredBounties.map((bounty, index) => (
              <motion.div
                key={bounty.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-yellow-500/30 transition-all duration-300 h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white truncate flex-1 mr-2">{bounty.title}</h3>
                    <Badge className={getSeverityColor(bounty.severity)}>
                      {bounty.severity}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-4 line-clamp-3">{bounty.description}</p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-300 capitalize">{bounty.severity} Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-semibold">${bounty.reward_amount.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {projects[bounty.project_id] && (
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-300">{projects[bounty.project_id].name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400">
                        Posted {new Date(bounty.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleClaimBounty(bounty.id)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                    size="sm"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Claim Bounty
                  </Button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400">
            Showing {filteredBounties.length} open bounties
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default BugBountiesView;
