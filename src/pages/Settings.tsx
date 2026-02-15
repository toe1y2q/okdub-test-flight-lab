
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Starfield } from '@/components/Starfield';
import { LogOut, Zap, User, Wallet, Save, Eye, EyeOff, Key } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  wallet_address: string | null;
  avatar_url: string | null;
}

const Settings = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [flutterwaveKey, setFlutterwaveKey] = useState('');
  const [showFwKey, setShowFwKey] = useState(false);
  const [savingFwKey, setSavingFwKey] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
      fetchFlutterwaveKey();
    }
  }, [isAuthenticated, user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setWalletAddress(data.wallet_address || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchFlutterwaveKey = async () => {
    if (!user) return;
    try {
      const { data } = await (supabase as any)
        .from('app_settings')
        .select('setting_value')
        .eq('user_id', user.id)
        .eq('setting_key', 'flutterwave_public_key')
        .maybeSingle();
      if (data?.setting_value) setFlutterwaveKey(data.setting_value);
    } catch {}
  };

  const handleSaveFwKey = async () => {
    if (!user || !flutterwaveKey.trim()) return;
    setSavingFwKey(true);
    try {
      const { error } = await (supabase as any)
        .from('app_settings')
        .upsert({
          user_id: user.id,
          setting_key: 'flutterwave_public_key',
          setting_value: flutterwaveKey.trim(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,setting_key' });
      if (error) throw error;
      toast.success('Flutterwave key saved!');
    } catch {
      toast.error('Failed to save key');
    } finally {
      setSavingFwKey(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: firstName || null,
          last_name: lastName || null,
          wallet_address: walletAddress || null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success('Profile updated successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
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
          <h1 className="text-4xl font-bold mb-3 text-cyan-400">Settings</h1>
          <p className="text-xl text-gray-400">Manage your account and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <div className="lg:col-span-2">
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Profile Information</h2>
              </div>

              {loadingProfile ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 bg-slate-800/50 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-slate-800/50 border-slate-700 text-white placeholder-gray-400"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-slate-800/50 border-slate-700 text-white placeholder-gray-400"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <div className="relative">
                      <Input
                        type={showEmail ? "text" : "password"}
                        value={user?.email}
                        readOnly
                        className="bg-slate-800/30 border-slate-700 text-gray-400 cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmail(!showEmail)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showEmail ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Wallet Address</label>
                    <Input
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder-gray-400"
                      placeholder="0x..."
                    />
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 font-semibold"
                  >
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </div>
                    )}
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Account Info */}
          <div className="space-y-6">
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                <Wallet className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Account Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">User ID</span>
                  <span className="text-gray-300 text-xs font-mono">
                    {user?.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </Card>

            {/* API Keys */}
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                <Key className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-bold text-white">API Keys</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Flutterwave Public Key</label>
                  <div className="relative">
                    <Input
                      type={showFwKey ? 'text' : 'password'}
                      value={flutterwaveKey}
                      onChange={(e) => setFlutterwaveKey(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder-gray-400 pr-10"
                      placeholder="FLWPUBK-..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowFwKey(!showFwKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showFwKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <Button
                  onClick={handleSaveFwKey}
                  disabled={savingFwKey || !flutterwaveKey.trim()}
                  size="sm"
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  <Save className="w-3 h-3 mr-2" />
                  {savingFwKey ? 'Saving...' : 'Save Key'}
                </Button>
              </div>
            </Card>

            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/nfts')}
                  variant="outline"
                  className="w-full border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
                >
                  View NFT Collection
                </Button>
                <Button
                  onClick={() => navigate('/rewards')}
                  variant="outline"
                  className="w-full border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
                >
                  Check Rewards
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
