
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Starfield } from '@/components/Starfield';
import { PaymentGuard } from '@/components/PaymentGuard';
import { FlutterwavePayment } from '@/components/FlutterwavePayment';
import { LogOut, Zap, Check, Crown, Star, Rocket, Users, Bug, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';

const Pricing = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const { isPro, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleUpgradeToPro = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    // Payment is now handled via Flutterwave checkout below
    setUpgrading(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user!.id,
          subscription_tier: 'pro',
          is_active: true,
          started_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success('Successfully upgraded to Pro! 🚀');
      setUpgrading(false);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('Payment received but failed to activate. Please contact support.');
      setUpgrading(false);
    }
  };

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        'View bug bounties',
        'Claim bounties',
        'Basic NFT marketplace access',
        'Community support'
      ],
      icon: Users,
      buttonText: 'Current Plan',
      current: !isPro,
      disabled: !isPro
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For serious developers and project creators',
      features: [
        'Create bug bounties',
        'Create projects',
        'Priority support',
        'Advanced analytics',
        'Custom project settings',
        'Higher visibility in marketplace'
      ],
      icon: Crown,
      buttonText: isPro ? 'Current Plan' : 'Upgrade to Pro',
      current: isPro,
      disabled: isPro,
      popular: true
    }
  ];

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-poppins flex items-center justify-center">
        <Starfield />
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
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
          {isAuthenticated && (
            <>
              <Badge className={isPro ? "bg-purple-500/20 text-purple-400" : "bg-gray-500/20 text-gray-400"}>
                <Crown className="w-3 h-3 mr-1" />
                {isPro ? 'Pro' : 'Free'} Plan
              </Badge>
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
            </>
          )}
          {!isAuthenticated && (
            <Button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              Sign In
            </Button>
          )}
        </div>
      </motion.nav>

      <div className="relative z-10 p-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Unlock the full potential of bug bounty hunting and project creation with our Pro plan
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <PaymentGuard 
          feature="advanced pricing plans"
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
              {pricingPlans.map((plan, index) => {
                const IconComponent = plan.icon;
                return (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <Card className={`p-8 backdrop-blur-xl border h-full relative ${
                      plan.popular 
                        ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/50' 
                        : 'bg-white/5 border-white/10'
                    }`}>
                      {plan.popular && (
                        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      )}
                      
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-4">
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                        <div className="flex items-baseline justify-center mb-2">
                          <span className="text-4xl font-bold text-white">{plan.price}</span>
                          <span className="text-gray-400 ml-1">{plan.period}</span>
                        </div>
                        <p className="text-gray-400">{plan.description}</p>
                      </div>

                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-gray-300">
                            <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {plan.name === 'Pro' && !isPro && isAuthenticated ? (
                        <FlutterwavePayment
                          amount={29}
                          currency="USD"
                          email={user?.email || ''}
                          onSuccess={handlePaymentSuccess}
                          onError={() => { toast.error('Payment failed'); setUpgrading(false); }}
                        />
                      ) : (
                        <Button
                          disabled={plan.disabled || upgrading}
                          onClick={plan.name === 'Pro' && !isPro ? handleUpgradeToPro : undefined}
                          className={`w-full ${
                            plan.popular
                              ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                              : plan.current
                              ? 'bg-gray-600 cursor-not-allowed'
                              : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700'
                          }`}
                        >
                          {plan.buttonText}
                        </Button>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          }
        >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {pricingPlans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className={`p-8 backdrop-blur-xl border h-full relative ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/50' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  )}
                  
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-4">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400 ml-1">{plan.period}</span>
                    </div>
                    <p className="text-gray-400">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-300">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {plan.name === 'Pro' && !isPro && isAuthenticated ? (
                    <FlutterwavePayment
                      amount={29}
                      currency="USD"
                      email={user?.email || ''}
                      onSuccess={handlePaymentSuccess}
                      onError={() => { toast.error('Payment failed'); setUpgrading(false); }}
                    />
                  ) : (
                    <Button
                      disabled={plan.disabled || upgrading}
                      onClick={plan.name === 'Pro' && !isPro ? handleUpgradeToPro : undefined}
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                          : plan.current
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700'
                      }`}
                    >
                      {plan.buttonText}
                    </Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
        </PaymentGuard>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-white">
            What's included in Pro?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 text-center">
              <Bug className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-xl font-bold text-white mb-2">Create Bug Bounties</h3>
              <p className="text-gray-400">Post your own bug bounties and attract skilled developers to fix your issues</p>
            </Card>
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 text-center">
              <FolderPlus className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <h3 className="text-xl font-bold text-white mb-2">Project Management</h3>
              <p className="text-gray-400">Create and manage multiple projects with advanced settings and analytics</p>
            </Card>
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 text-center">
              <Rocket className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-bold text-white mb-2">Priority Support</h3>
              <p className="text-gray-400">Get faster response times and dedicated support for your projects</p>
            </Card>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 text-left">
              <h3 className="text-lg font-bold text-white mb-2">Can I downgrade anytime?</h3>
              <p className="text-gray-400">Yes, you can downgrade to the free plan at any time. Your created bounties and projects will remain accessible.</p>
            </Card>
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 text-left">
              <h3 className="text-lg font-bold text-white mb-2">How do payments work?</h3>
              <p className="text-gray-400">We support both traditional payments and Solana cryptocurrency. All transactions are secure and processed instantly.</p>
            </Card>
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 text-left">
              <h3 className="text-lg font-bold text-white mb-2">What about my existing bounties?</h3>
              <p className="text-gray-400">All your existing bounties and rewards remain yours. Pro users get additional features for creating new content.</p>
            </Card>
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 text-left">
              <h3 className="text-lg font-bold text-white mb-2">Is there a free trial?</h3>
              <p className="text-gray-400">The free plan gives you full access to participate in bounties. Upgrade to Pro when you're ready to create your own.</p>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
