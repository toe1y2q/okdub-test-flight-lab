
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Starfield } from '@/components/Starfield';
import { SolanaPayment } from '@/components/SolanaPayment';
import { LogOut, Zap, CreditCard, Lock, ArrowLeft } from 'lucide-react';
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
  };
}

const Payment = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({
    payment_method: 'credit_card',
    card_number: '',
    expiry_date: '',
    cvv: '',
    cardholder_name: '',
    billing_address: '',
    city: '',
    postal_code: '',
    country: 'US'
  });

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
            price
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoadingCart(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.nft.price * item.quantity), 0);
  };

  const processTraditionalPayment = async () => {
    if (!paymentData.card_number || !paymentData.expiry_date || !paymentData.cvv || !paymentData.cardholder_name) {
      toast.error('Please fill in all payment details');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setProcessingPayment(true);
    try {
      const totalAmount = getTotalAmount();

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user?.id,
          total_amount: totalAmount,
          currency: 'USD',
          payment_method: paymentData.payment_method,
          status: 'completed',
          transaction_id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      const paymentItems = cartItems.map(item => ({
        payment_id: payment.id,
        nft_id: item.nft.id,
        price: item.nft.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('payment_items')
        .insert(paymentItems);

      if (itemsError) throw itemsError;

      await clearCart();
      toast.success('Payment processed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
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
          <p className="text-xl text-gray-400">Complete your NFT purchase</p>
        </motion.div>

        {loadingCart ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400"></div>
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

            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Tabs defaultValue="traditional" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="traditional">Credit Card</TabsTrigger>
                  <TabsTrigger value="solana">Solana</TabsTrigger>
                </TabsList>
                
                <TabsContent value="traditional">
                  <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <Lock className="w-5 h-5 mr-2 text-green-400" />
                      Payment Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="payment_method" className="text-white">Payment Method</Label>
                        <Select value={paymentData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
                          <SelectTrigger className="bg-slate-800/50 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="credit_card">Credit Card</SelectItem>
                            <SelectItem value="debit_card">Debit Card</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="cardholder_name" className="text-white">Cardholder Name</Label>
                        <Input
                          id="cardholder_name"
                          value={paymentData.cardholder_name}
                          onChange={(e) => handleInputChange('cardholder_name', e.target.value)}
                          placeholder="John Doe"
                          className="bg-slate-800/50 border-gray-600 text-white"
                        />
                      </div>

                      <div>
                        <Label htmlFor="card_number" className="text-white">Card Number</Label>
                        <Input
                          id="card_number"
                          value={paymentData.card_number}
                          onChange={(e) => handleInputChange('card_number', e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          className="bg-slate-800/50 border-gray-600 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry_date" className="text-white">Expiry Date</Label>
                          <Input
                            id="expiry_date"
                            value={paymentData.expiry_date}
                            onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                            placeholder="MM/YY"
                            className="bg-slate-800/50 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv" className="text-white">CVV</Label>
                          <Input
                            id="cvv"
                            value={paymentData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value)}
                            placeholder="123"
                            className="bg-slate-800/50 border-gray-600 text-white"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={processTraditionalPayment}
                        disabled={processingPayment || cartItems.length === 0}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg py-3"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        {processingPayment ? 'Processing...' : `Pay $${getTotalAmount().toFixed(2)}`}
                      </Button>
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="solana">
                  <SolanaPayment
                    totalAmount={getTotalAmount() / 100} // Convert to SOL (approximate)
                    cartItems={cartItems}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
