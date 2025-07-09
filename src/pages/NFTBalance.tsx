
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Starfield } from '@/components/Starfield';
import { LogOut, Zap, Image, ExternalLink, Copy, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface NFTMint {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  token_id: string | null;
  contract_address: string | null;
  tx_hash: string | null;
  network: string;
  status: string;
  price: number | null;
  for_sale: boolean | null;
  created_at: string;
  minted_at: string | null;
}

const NFTBalance = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [nfts, setNfts] = useState<NFTMint[]>([]);
  const [loadingNfts, setLoadingNfts] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNFTs();
    }
  }, [isAuthenticated, user]);

  const fetchNFTs = async () => {
    try {
      const { data, error } = await supabase
        .from('nft_mints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNfts(data || []);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      toast.error('Failed to load NFTs');
    } finally {
      setLoadingNfts(false);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
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
          <h1 className="text-4xl font-bold mb-3 text-cyan-400">NFT Collection</h1>
          <p className="text-xl text-gray-400">Your minted NFTs and digital assets</p>
        </motion.div>

        {loadingNfts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 animate-pulse">
                <div className="aspect-square bg-slate-800/50 rounded-lg mb-4"></div>
                <div className="h-4 bg-slate-800/50 rounded mb-2"></div>
                <div className="h-3 bg-slate-800/50 rounded"></div>
              </Card>
            ))}
          </div>
        ) : nfts.length === 0 ? (
          <Card className="p-12 backdrop-blur-xl bg-white/5 border border-white/10 text-center">
            <Image className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No NFTs Found</h3>
            <p className="text-gray-400 mb-6">Start minting NFTs to build your collection!</p>
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              Go to Dashboard
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft, index) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="p-4 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 h-full">
                  <div className="aspect-square bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                    {nft.image_url ? (
                      <img 
                        src={nft.image_url} 
                        alt={nft.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Image className="w-12 h-12 text-gray-400" />
                    )}
                    
                    {nft.for_sale && (
                      <div className="absolute top-2 right-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded">
                        For Sale
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white truncate">{nft.name}</h3>
                    {nft.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">{nft.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="capitalize">{nft.network}</span>
                      <span className={`px-2 py-1 rounded ${
                        nft.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        nft.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {nft.status}
                      </span>
                    </div>

                    {nft.for_sale && nft.price && (
                      <div className="text-sm text-green-400 font-semibold">
                        Price: ${nft.price.toFixed(2)}
                      </div>
                    )}

                    {nft.token_id && (
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>Token ID: {nft.token_id}</span>
                        <button
                          onClick={() => copyToClipboard(nft.token_id!)}
                          className="hover:text-cyan-400 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {nft.tx_hash && (
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-gray-400">TX:</span>
                        <button
                          onClick={() => copyToClipboard(nft.tx_hash!)}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-1"
                        >
                          <span className="truncate max-w-20">{nft.tx_hash}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        onClick={() => navigate(`/nft/${nft.id}`)}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
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

export default NFTBalance;
