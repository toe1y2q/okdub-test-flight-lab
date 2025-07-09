
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Starfield } from '@/components/Starfield';
import { LogOut, Zap, Plus, Briefcase, DollarSign, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description: string;
  project_type: string;
  budget: number;
  status: string;
  created_at: string;
  client_user_id: string;
}

const Projects = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_type: 'smart_contract',
    budget: 0
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('projects')
        .insert([{
          ...formData,
          client_user_id: user.id
        }]);

      if (error) throw error;

      toast.success('Project created successfully!');
      setShowCreateForm(false);
      setFormData({ name: '', description: '', project_type: 'smart_contract', budget: 0 });
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
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
            Dashboard
          </Button>
          <Button
            onClick={() => navigate('/bounties')}
            variant="outline"
            size="sm"
            className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
          >
            Bug Bounties
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
            <h1 className="text-4xl font-bold mb-3 text-cyan-400">QA Testing Projects</h1>
            <p className="text-xl text-gray-400">Submit your projects for professional testing</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </motion.div>

        {/* Create Project Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-cyan-400">Create New Project</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter project name"
                    className="bg-slate-800/50 border-slate-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your project and testing requirements"
                    className="bg-slate-800/50 border-slate-700 text-white"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Type</label>
                    <Select value={formData.project_type} onValueChange={(value) => setFormData({ ...formData, project_type: value })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smart_contract">Smart Contract</SelectItem>
                        <SelectItem value="dapp">DApp</SelectItem>
                        <SelectItem value="defi">DeFi Protocol</SelectItem>
                        <SelectItem value="nft">NFT Project</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Budget (USD)</label>
                    <Input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                      placeholder="Project budget"
                      className="bg-slate-800/50 border-slate-700 text-white"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                  >
                    Create Project
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

        {/* Projects Grid */}
        {loadingProjects ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 animate-pulse">
                <div className="h-4 bg-slate-800/50 rounded mb-4"></div>
                <div className="h-3 bg-slate-800/50 rounded mb-2"></div>
                <div className="h-3 bg-slate-800/50 rounded"></div>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="p-12 backdrop-blur-xl bg-white/5 border border-white/10 text-center">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Projects Found</h3>
            <p className="text-gray-400 mb-6">Start by creating your first testing project!</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              Create Project
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white truncate">{project.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      project.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  {project.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-3">{project.description}</p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Briefcase className="w-4 h-4 text-cyan-400" />
                      <span className="text-gray-300 capitalize">{project.project_type.replace('_', ' ')}</span>
                    </div>
                    
                    {project.budget > 0 && (
                      <div className="flex items-center space-x-2 text-sm">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">${project.budget.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <Button
                      onClick={() => navigate(`/bounties?project=${project.id}`)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      size="sm"
                    >
                      View Bug Bounties
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
