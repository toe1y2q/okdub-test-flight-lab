import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowRight, 
  Gamepad2, 
  Zap, 
  Shield, 
  Coins, 
  TrendingUp, 
  Users,
  Star,
  Play,
  Menu,
  X 
} from 'lucide-react';
import { WalletConnection } from '@/components/WalletConnection';
import { Starfield } from '@/components/Starfield';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [loading, isAuthenticated, navigate]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-poppins flex items-center justify-center">
        <Starfield />
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Gamepad2,
      title: "Web3 Gaming",
      description: "Play-to-earn games with real rewards",
      color: "neon-cyan"
    },
    {
      icon: Shield,
      title: "Secure Testing",
      description: "Safe testnet environment for all transactions",
      color: "neon-purple"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Real-time blockchain interaction monitoring",
      color: "gold"
    }
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Games Tested", value: "1M+", icon: Gamepad2 },
    { label: "Rewards Earned", value: "$2.5M", icon: Coins },
    { label: "Success Rate", value: "99.9%", icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-poppins">
      <Starfield />
      
      {/* Mobile Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-50 glass-morphism m-2 rounded-xl"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <motion.img
                src="/lovable-uploads/3e7c2c9a-0c07-4a59-afbc-c68bc09a5223.png"
                alt="Okdub Casino"
                className="w-8 h-8 sm:w-10 sm:h-10"
                animate={{ 
                  filter: [
                    "drop-shadow(0 0 10px hsl(var(--gold) / 0.8))",
                    "drop-shadow(0 0 20px hsl(var(--gold) / 0.6))",
                    "drop-shadow(0 0 10px hsl(var(--gold) / 0.8))"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-lg sm:text-xl font-bold gradient-text">
                Okdub Casino
              </span>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                className="border-glass-border/30 text-foreground hover:bg-glass/20"
              >
                Sign In
              </Button>
              <WalletConnection 
                onConnect={(address) => {
                  setIsConnected(true);
                  setWalletAddress(address);
                }}
                isConnected={isConnected}
                address={walletAddress}
              />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden mt-4 pt-4 border-t border-glass-border/20"
              >
                <div className="flex flex-col space-y-3">
                  <Button
                    onClick={() => navigate('/auth')}
                    variant="outline"
                    className="border-glass-border/30 text-foreground hover:bg-glass/20 w-full"
                  >
                    Sign In
                  </Button>
                  <WalletConnection 
                    onConnect={(address) => {
                      setIsConnected(true);
                      setWalletAddress(address);
                    }}
                    isConnected={isConnected}
                    address={walletAddress}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[90vh] flex items-center">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-6"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 gradient-text leading-tight">
                The Future of Web3 Testing
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-medium mb-2">
                Build. Break. Rebuild. Repeat.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground/80">
                Where tomorrow's decentralized experiences are stress-tested today
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Button
                onClick={() => navigate('/auth')}
                size="lg"
                className="px-8 py-4 text-lg font-bold bg-primary hover:bg-primary/90 purple-glow transition-all duration-300 w-full sm:w-auto"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Testing Now
              </Button>
              
              <Button
                onClick={() => navigate('/learn-more')}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-medium border-glass-border/30 hover:bg-glass/20 w-full sm:w-auto"
              >
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.05 }}
                  className="glass-morphism p-4 rounded-xl text-center"
                >
                  <stat.icon className="w-6 h-6 text-secondary mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 gradient-text">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to test, deploy, and perfect your Web3 applications
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-morphism p-6 rounded-xl hover:border-glass-border/40 transition-all duration-300"
              >
                <feature.icon className={`w-12 h-12 text-${feature.color} mb-4 glow-effect`} />
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-morphism p-8 sm:p-12 rounded-2xl text-center max-w-4xl mx-auto"
          >
            <Star className="w-16 h-16 text-gold mx-auto mb-6 gold-glow" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 gradient-text">
              Ready to Start Testing?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers building the future of Web3. 
              Start your testing journey today.
            </p>
            
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="px-8 sm:px-12 py-4 text-lg font-bold bg-primary hover:bg-primary/90 purple-glow transition-all duration-300"
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-glass-border/20 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <img
                src="/lovable-uploads/3e7c2c9a-0c07-4a59-afbc-c68bc09a5223.png"
                alt="Okdub Casino"
                className="w-6 h-6"
              />
              <span className="text-sm font-medium text-muted-foreground">
                © 2024 Okdub Casino. All rights reserved.
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Built for the Web3 future
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;