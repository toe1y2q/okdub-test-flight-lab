
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowDown, Plus, Search, Zap, Rocket, Shield } from 'lucide-react';
import { WalletConnection } from '@/components/WalletConnection';
import { Starfield } from '@/components/Starfield';
import { GlassPanel } from '@/components/GlassPanel';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [loading, isAuthenticated, navigate]);

  // Fixed animation variants with proper types
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  const floatingVariants: Variants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  // Show loading while checking auth state
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

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-poppins">
      <Starfield />
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 flex justify-between items-center p-4 sm:p-6 backdrop-blur-sm"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2 sm:space-x-3"
        >
          <motion.img
            src="/lovable-uploads/3e7c2c9a-0c07-4a59-afbc-c68bc09a5223.png"
            alt="Okdub Casino"
            className="w-10 h-10 sm:w-12 sm:h-12"
            animate={{ 
              filter: [
                "drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))",
                "drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))",
                "drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Okdub Casino
          </span>
        </motion.div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button
            onClick={() => navigate('/auth')}
            variant="outline"
            className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 font-semibold text-sm sm:text-base px-3 sm:px-4"
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
      </motion.nav>

      {/* Landing Hero */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 sm:px-6"
      >
        <motion.div
          variants={itemVariants}
          className="text-center max-w-5xl"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent text-shadow leading-tight"
          >
            The Future of Web3 Testing
          </motion.h1>
          
          <motion.div
            variants={itemVariants}
            className="space-y-4 sm:space-y-6 mb-8 sm:mb-12"
          >
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 font-semibold leading-relaxed">
              Build. Break. Rebuild. Repeat.
            </p>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 font-medium px-4 sm:px-0">
              Where tomorrow's decentralized experiences are stress-tested today
            </p>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-4xl mx-auto px-4 sm:px-0"
          >
            {[
              { icon: Rocket, title: "Launch Tests", desc: "Deploy & test smart contracts" },
              { icon: Shield, title: "Secure Testing", desc: "Safe testnet environment" },
              { icon: Zap, title: "Instant Results", desc: "Real-time transaction monitoring" }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-4 sm:p-6 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/30 transition-all duration-300"
              >
                <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 mb-3 sm:mb-4 mx-auto" />
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="px-6 sm:px-8 md:px-10 py-4 sm:py-5 text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 border border-cyan-400/30 w-full sm:w-auto"
            >
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Start Testing Now</span>
              </div>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute bottom-8"
        >
          <ArrowDown className="w-6 h-6 text-cyan-400 animate-pulse" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
