
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Starfield } from '@/components/Starfield';
import { LogOut, Zap, Search, Eye, User, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface MarketplaceNFT {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  for_sale: boolean;
  created_at: string;
  minted_at: string;
  token_id: string;
  username: string;
  first_name: string;
  last_name: string;
}

const Marketplace = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [nfts, setNfts] = useState<MarketplaceNFT[]>([]);
  const [loadingNfts, setLoadingNfts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNfts, setFilteredNfts] = useState<MarketplaceNFT[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMarketplaceNfts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = nfts.filter(nft =>
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${nft.first_name} ${nft.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNfts(filtered);
    } else {
      setFilteredNfts(nfts);
    }
  }, [searchTerm, nfts]);

  const fetchMarketplaceNfts = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_nfts')
        .select('*')
        .order('minted_at', { ascending: false });

      if (error) throw error;
      setNfts(data || []);
      setFilteredNfts(data || []);
    } catch (error) {
      console.error('Error fetching marketplace NFTs:', error);
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

  const getCreatorName = (nft: MarketplaceNFT) => {
    if (nft.username) return `@${nft.username}`;
    if (nft.first_name && nft.last_name) return `${nft.first_name} ${nft.last_name}`;
    if (nft.first_name) return nft.first_name;
    return 'Anonymous';
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
            onClick={() => navigate('/balance')}
            variant="outline"
            size="sm"
            className="border-green-400/30 text-green-400 hover:bg-green-400/10"
          >
            Balance
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
          <h1 className="text-4xl font-bold mb-3 text-purple-400">NFT Marketplace</h1>
          <p className="text-xl text-gray-400">Discover and explore NFTs created by the community</p>
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
              placeholder="Search NFTs, creators..."
              className="pl-10 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
        </motion.div>

        {/* NFT Grid */}
        {loadingNfts ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400"></div>
          </div>
        ) : filteredNfts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Eye className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No NFTs Found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Be the first to mint an NFT!'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredNfts.map((nft, index) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Card className="overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
                  {/* NFT Image */}
                  <div className="relative aspect-square overflow-hidden">
                    {nft.image_url ? (
                      <img
                        src={nft.image_url}
                        alt={nft.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <Zap className="w-16 h-16 text-purple-400 opacity-50" />
                      </div>
                    )}
                    {nft.token_id && (
                      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                        <span className="text-xs text-white font-mono">#{nft.token_id}</span>
                      </div>
                    )}
                  </div>

                  {/* NFT Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2 truncate">{nft.name}</h3>
                    
                    {nft.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{nft.description}</p>
                    )}

                    {/* Creator Info */}
                    <div className="flex items-center space-x-2 mb-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{getCreatorName(nft)}</span>
                    </div>

                    {/* Mint Date */}
                    <div className="flex items-center space-x-2 mb-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        Minted {new Date(nft.minted_at || nft.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Price (if for sale) */}
                    {nft.for_sale && nft.price > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-semibold">${nft.price.toFixed(2)}</span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          onClick={() => toast.info('Purchasing feature coming soon!')}
                        >
                          Buy Now
                        </Button>
                      </div>
                    )}
                  </div>
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
            Showing {filteredNfts.length} of {nfts.length} NFTs
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Marketplace;
