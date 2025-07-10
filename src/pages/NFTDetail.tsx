import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Starfield } from '@/components/Starfield';
import { LogOut, Zap, Edit, DollarSign, User, Calendar, Hash, ArrowLeft, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface NFTDetail {
  id: string;
  name: string;
  description: string;
  image_url: string;
  token_id: string;
  contract_address: string;
  network: string;
  status: string;
  price: number;
  for_sale: boolean;
  created_at: string;
  minted_at: string;
  current_owner_id: string;
  original_creator_id: string;
  user_id: string;
}

interface NFTSale {
  id: string;
  price: number;
  status: string;
  created_at: string;
}

const NFTDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [nft, setNft] = useState<NFTDetail | null>(null);
  const [sale, setSale] = useState<NFTSale | null>(null);
  const [loadingNft, setLoadingNft] = useState(true);
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [salePrice, setSalePrice] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchNFTDetail();
    }
  }, [isAuthenticated, id]);

  const fetchNFTDetail = async () => {
    if (!id) return;

    try {
      const { data: nftData, error: nftError } = await supabase
        .from('nft_mints')
        .select('*')
        .eq('id', id)
        .single();

      if (nftError) throw nftError;
      setNft(nftData);

      // Check if there's an active sale
      const { data: saleData, error: saleError } = await supabase
        .from('nft_sales')
        .select('*')
        .eq('nft_id', id)
        .eq('status', 'listed')
        .maybeSingle();

      if (!saleError && saleData) {
        setSale(saleData);
      }
    } catch (error) {
      console.error('Error fetching NFT detail:', error);
      toast.error('Failed to load NFT details');
      navigate('/nfts');
    } finally {
      setLoadingNft(false);
    }
  };

  const handleListForSale = async () => {
    if (!nft || !user || !salePrice) return;

    const price = parseFloat(salePrice);
    if (price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      // Update NFT to mark as for sale
      const { error: nftError } = await supabase
        .from('nft_mints')
        .update({ 
          for_sale: true, 
          price: price 
        })
        .eq('id', nft.id);

      if (nftError) throw nftError;

      // Create sale listing
      const { error: saleError } = await supabase
        .from('nft_sales')
        .insert([{
          nft_id: nft.id,
          seller_id: user.id,
          price: price,
          status: 'listed'
        }]);

      if (saleError) throw saleError;

      toast.success('NFT listed for sale successfully!');
      setShowPriceInput(false);
      setSalePrice('');
      fetchNFTDetail();
    } catch (error) {
      console.error('Error listing NFT for sale:', error);
      toast.error('Failed to list NFT for sale');
    }
  };

  const handleRemoveFromSale = async () => {
    if (!nft || !user) return;

    try {
      // Update NFT to remove from sale
      const { error: nftError } = await supabase
        .from('nft_mints')
        .update({ 
          for_sale: false, 
          price: 0 
        })
        .eq('id', nft.id);

      if (nftError) throw nftError;

      // Cancel sale listing
      if (sale) {
        const { error: saleError } = await supabase
          .from('nft_sales')
          .update({ status: 'cancelled' })
          .eq('id', sale.id);

        if (saleError) throw saleError;
      }

      toast.success('NFT removed from sale');
      fetchNFTDetail();
    } catch (error) {
      console.error('Error removing NFT from sale:', error);
      toast.error('Failed to remove NFT from sale');
    }
  };

  const handlePurchase = async () => {
    if (!nft || !user || !sale || isCreator) {
      if (isCreator) {
        toast.error('You cannot purchase your own NFT');
      }
      return;
    }

    try {
      // Update sale record
      const { error: saleError } = await supabase
        .from('nft_sales')
        .update({ 
          buyer_id: user.id,
          status: 'sold',
          sold_at: new Date().toISOString()
        })
        .eq('id', sale.id);

      if (saleError) throw saleError;

      // Update NFT ownership
      const { error: nftError } = await supabase
        .from('nft_mints')
        .update({ 
          current_owner_id: user.id,
          for_sale: false,
          price: 0
        })
        .eq('id', nft.id);

      if (nftError) throw nftError;

      toast.success('NFT purchased successfully!');
      navigate('/nfts');
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      toast.error('Failed to purchase NFT');
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

  const isOwner = nft && user && (nft.current_owner_id === user.id || nft.user_id === user.id);
  const isCreator = nft && user && (nft.user_id === user.id || nft.original_creator_id === user.id);
  const canPurchase = nft && user && sale && !isOwner && !isCreator && sale.status === 'listed';

  if (loading || loadingNft) {
    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-poppins flex items-center justify-center">
        <Starfield />
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !nft) {
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
            onClick={() => navigate('/nfts')}
            variant="outline"
            size="sm"
            className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to NFTs
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

      <div className="relative z-10 p-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* NFT Image */}
          <Card className="overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10">
            <div className="aspect-square relative">
              {nft.image_url ? (
                <img
                  src={nft.image_url}
                  alt={nft.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Zap className="w-32 h-32 text-purple-400 opacity-50" />
                </div>
              )}
              
              {nft.for_sale && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    For Sale
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          {/* NFT Details */}
          <div className="space-y-6">
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <h1 className="text-3xl font-bold text-white mb-4">{nft.name}</h1>
              
              {nft.description && (
                <p className="text-gray-400 mb-6">{nft.description}</p>
              )}

              <div className="space-y-4">
                {nft.token_id && (
                  <div className="flex items-center space-x-3">
                    <Hash className="w-5 h-5 text-cyan-400" />
                    <span className="text-gray-300">Token ID: {nft.token_id}</span>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">
                    {isOwner ? 'Owned by you' : 'Owned by another user'}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">
                    Minted {new Date(nft.minted_at || nft.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge className={`${
                    nft.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    nft.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {nft.status}
                  </Badge>
                  <span className="text-gray-400 capitalize">{nft.network}</span>
                </div>
              </div>
            </Card>

            {/* Price and Actions */}
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              {sale && sale.status === 'listed' && (
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <DollarSign className="w-6 h-6 text-green-400" />
                    <span className="text-3xl font-bold text-green-400">${sale.price.toFixed(2)}</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Listed {new Date(sale.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {isOwner && !nft.for_sale && (
                  <>
                    {!showPriceInput ? (
                      <Button
                        onClick={() => setShowPriceInput(true)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        List for Sale
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Input
                          type="number"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          placeholder="Enter price in USD"
                          className="bg-slate-800/50 border-slate-700 text-white"
                          min="0"
                          step="0.01"
                        />
                        <div className="flex space-x-3">
                          <Button
                            onClick={handleListForSale}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          >
                            Confirm Listing
                          </Button>
                          <Button
                            onClick={() => {
                              setShowPriceInput(false);
                              setSalePrice('');
                            }}
                            variant="outline"
                            className="border-gray-600 text-gray-400 hover:bg-gray-600/10"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {isOwner && nft.for_sale && (
                  <Button
                    onClick={handleRemoveFromSale}
                    variant="outline"
                    className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    Remove from Sale
                  </Button>
                )}

                {canPurchase && (
                  <Button
                    onClick={handlePurchase}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Purchase with Solana
                  </Button>
                )}

                {isCreator && nft.for_sale && (
                  <div className="text-center text-yellow-400 py-4 bg-yellow-500/10 rounded-lg">
                    <p className="font-semibold">This is your NFT</p>
                    <p className="text-sm">You cannot purchase your own creation</p>
                  </div>
                )}

                {!isOwner && !canPurchase && !isCreator && nft.for_sale && (
                  <div className="text-center text-gray-400 py-4">
                    This NFT is not available for purchase
                  </div>
                )}

                {!nft.for_sale && !isOwner && !isCreator && (
                  <div className="text-center text-gray-400 py-4">
                    This NFT is not for sale
                  </div>
                )}
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NFTDetail;
