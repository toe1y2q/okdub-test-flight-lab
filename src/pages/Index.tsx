
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowDown, Plus, Search, Zap, Rocket, Shield } from 'lucide-react';
import { WalletConnection } from '@/components/WalletConnection';
import { Starfield } from '@/components/Starfield';
import { GlassPanel } from '@/components/GlassPanel';

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-poppins">
      <Starfield />
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 flex justify-between items-center p-6 backdrop-blur-sm"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-3"
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
        
        <WalletConnection 
          onConnect={(address) => {
            setIsConnected(true);
            setWalletAddress(address);
          }}
          isConnected={isConnected}
          address={walletAddress}
        />
      </motion.nav>

      <AnimatePresence mode="wait">
        {!isConnected ? (
          /* Landing Hero */
          <motion.div
            key="landing"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.9 }}
            variants={containerVariants}
            className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6"
          >
            <motion.div
              variants={itemVariants}
              className="text-center max-w-5xl"
            >
              <motion.h1 
                variants={itemVariants}
                className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent text-shadow"
              >
                The Future of Web3 Testing
              </motion.h1>
              
              <motion.div
                variants={itemVariants}
                className="space-y-6 mb-12"
              >
                <p className="text-2xl md:text-3xl text-gray-300 font-semibold leading-relaxed">
                  Build. Break. Rebuild. Repeat.
                </p>
                <p className="text-lg md:text-xl text-gray-400 font-medium">
                  Where tomorrow's decentralized experiences are stress-tested today
                </p>
              </motion.div>

              {/* Feature highlights */}
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
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
                    className="p-6 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/30 transition-all duration-300"
                  >
                    <feature.icon className="w-8 h-8 text-cyan-400 mb-4 mx-auto" />
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <WalletConnection 
                  onConnect={(address) => {
                    setIsConnected(true);
                    setWalletAddress(address);
                  }}
                  isConnected={isConnected}
                  address={walletAddress}
                  variant="hero"
                />
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
        ) : (
          /* Mission Control Dashboard */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 p-6 max-w-7xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-4xl font-bold mb-3 text-cyan-400 text-shadow">Mission Control</h2>
              <p className="text-xl text-gray-400 font-medium">Welcome to your Web3 testing command center</p>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              <motion.div variants={itemVariants}>
                <GlassPanel className="p-6 h-full">
                  <h3 className="text-xl font-semibold mb-4 text-purple-400">Wallet Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium">Address:</span>
                      <span className="text-cyan-400 font-mono text-sm font-semibold">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium">Network:</span>
                      <span className="text-green-400 font-semibold">Ethereum Mainnet</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium">Status:</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-green-400 font-semibold">Connected</span>
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>

              <motion.div variants={itemVariants}>
                <GlassPanel className="p-6 h-full">
                  <h3 className="text-xl font-semibold mb-4 text-purple-400">Test Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium">Tests Run:</span>
                      <span className="text-cyan-400 font-bold text-lg">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium">Success Rate:</span>
                      <span className="text-green-400 font-bold">100%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium">NFTs Minted:</span>
                      <span className="text-purple-400 font-bold text-lg">0</span>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>

              <motion.div variants={itemVariants}>
                <GlassPanel className="p-6 h-full">
                  <h3 className="text-xl font-semibold mb-4 text-purple-400">Quick Actions</h3>
                  <div className="space-y-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 font-semibold">
                        <Plus className="w-4 h-4 mr-2" />
                        Run Test Transaction
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/10 font-semibold">
                        <Search className="w-4 h-4 mr-2" />
                        View Test History
                      </Button>
                    </motion.div>
                  </div>
                </GlassPanel>
              </motion.div>
            </motion.div>

            {/* Test Runner Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassPanel className="p-6 mb-8">
                <h3 className="text-2xl font-bold mb-4 text-cyan-400">Blockchain Test Runner</h3>
                <p className="text-gray-400 mb-6 font-medium">Execute test transactions and monitor their progress in real-time</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h4 className="text-lg font-semibold mb-3 text-purple-400">Test Configuration</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <span className="text-gray-400 font-medium">Test Type:</span>
                        <span className="text-cyan-400 font-semibold">Token Transfer</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <span className="text-gray-400 font-medium">Network:</span>
                        <span className="text-green-400 font-semibold">Sepolia Testnet</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <span className="text-gray-400 font-medium">Gas Estimate:</span>
                        <span className="text-yellow-400 font-semibold">21,000 gwei</span>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h4 className="text-lg font-semibold mb-3 text-purple-400">Test Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <div className="w-3 h-3 bg-gray-500 rounded-full mr-3 animate-pulse-slow"></div>
                        <span className="text-gray-400 font-medium">Ready to Execute</span>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        className="w-full mt-4 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 font-semibold text-lg py-3"
                      >
                        Launch Test Sequence
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </GlassPanel>
            </motion.div>

            {/* Leaderboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <GlassPanel className="p-6">
                <h3 className="text-2xl font-bold mb-4 text-cyan-400">Leaderboard of Innovators</h3>
                <p className="text-gray-400 mb-6 font-medium">Weekly ranking of the most active Web3 testers</p>
                
                <div className="space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20"
                  >
                    <div className="flex items-center">
                      <motion.div 
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-4"
                      >
                        <span className="text-sm font-bold text-black">1</span>
                      </motion.div>
                      <div>
                        <p className="font-semibold text-yellow-400 font-mono">0x1234...5678</p>
                        <p className="text-sm text-gray-400 font-medium">156 tests completed</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-2xl"
                    >
                      🏆
                    </motion.div>
                  </motion.div>
                  
                  <div className="text-center py-8 text-gray-500">
                    <motion.p
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="font-medium"
                    >
                      Connect your wallet and start testing to join the leaderboard!
                    </motion.p>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
