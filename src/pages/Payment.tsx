import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, ArrowLeft } from 'lucide-react';
import { Starfield } from '@/components/Starfield';
import { SolanaPayment } from '@/components/SolanaPayment';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  quantity: number;
  nft: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    price: number;
    user_id: string;
    original_creator_id: string;
  };
}

const Payment = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartItems();
    }
  }, [isAuthenticated]);

  const fetchCartItems = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          nft:nft_mints (
            id,
            name,
            description,
            image_url,
            price,
            user_id,
            original_creator_id
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      // Filter out NFTs created by the current user
      const validCartItems = (data || []).filter(item => {
        const isCreator = item.nft.user_id === user?.id || item.nft.original_creator_id === user?.id;
        if (isCreator) {
          // Remove invalid items from cart
          supabase
            .from('cart_items')
            .delete()
            .eq('id', item.id)
            .then(() => {
              toast.error(`Removed "${item.nft.name}" - you cannot buy your own NFT`);
            });
        }
        return !isCreator;
      });
      
      setCartItems(validCartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoadingCart(false);
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.nft.price * item.quantity), 0);
  };

  const clearCart = async () => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user?.id);

    if (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const handlePaymentSuccess = async () => {
    await clearCart();
    navigate('/dashboard');
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
            onClick={() => navigate('/cart')}
            variant="outline"
            size="sm"
            className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
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
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-3 text-green-400">Secure Payment</h1>
          <p className="text-xl text-gray-400">Complete your NFT purchase with Solana</p>
        </motion.div>

        {loadingCart ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-400 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Add some NFTs to your cart to proceed with payment</p>
            <Button
              onClick={() => navigate('/marketplace')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Browse Marketplace
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 rounded-lg bg-slate-800/30">
                      <div className="w-12 h-12 rounded-lg overflow-hidden">
                        {item.nft.image_url ? (
                          <img
                            src={item.nft.image_url}
                            alt={item.nft.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-purple-400 opacity-50" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{item.nft.name}</h4>
                        <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-green-400">${(item.nft.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-600 pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span className="text-white">Total:</span>
                    <span className="text-green-400">${getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Solana Payment Only */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <SolanaPayment
                totalAmount={getTotalAmount() / 100} // Convert to SOL (approximate)
                cartItems={cartItems}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
