
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowDown, Plus, Search } from 'lucide-react';
import { WalletConnection } from '@/components/WalletConnection';
import { Starfield } from '@/components/Starfield';
import { GlassPanel } from '@/components/GlassPanel';

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <Starfield />
      
      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg"></div>
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
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
      </nav>

      {!isConnected ? (
        /* Landing Hero */
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              The Future of Web3 Testing
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Build. Break. Rebuild. Repeat.
            </p>
            <p className="text-lg text-gray-400 mb-12">
              Where tomorrow's decentralized experiences are stress-tested today
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
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
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8"
          >
            <ArrowDown className="w-6 h-6 text-cyan-400" />
          </motion.div>
        </div>
      ) : (
        /* Mission Control Dashboard */
        <div className="relative z-10 p-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold mb-2 text-cyan-400">Mission Control</h2>
            <p className="text-gray-400">Welcome to your Web3 testing command center</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <GlassPanel className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Wallet Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Address:</span>
                  <span className="text-cyan-400 font-mono text-sm">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-green-400">Ethereum Mainnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-green-400">Connected</span>
                  </div>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Test Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tests Run:</span>
                  <span className="text-cyan-400 font-bold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Rate:</span>
                  <span className="text-green-400">100%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">NFTs Minted:</span>
                  <span className="text-purple-400 font-bold">0</span>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Run Test Transaction
                </Button>
                <Button variant="outline" className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/10">
                  <Search className="w-4 h-4 mr-2" />
                  View Test History
                </Button>
              </div>
            </GlassPanel>
          </div>

          {/* Test Runner Section */}
          <GlassPanel className="p-6 mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-cyan-400">Blockchain Test Runner</h3>
            <p className="text-gray-400 mb-6">Execute test transactions and monitor their progress in real-time</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-3 text-purple-400">Test Configuration</h4>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-400">Test Type:</span>
                    <span className="text-cyan-400">Token Transfer</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-400">Network:</span>
                    <span className="text-green-400">Sepolia Testnet</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-400">Gas Estimate:</span>
                    <span className="text-yellow-400">21,000 gwei</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-3 text-purple-400">Test Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-slate-800/50 rounded-lg">
                    <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                    <span className="text-gray-400">Ready to Execute</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600"
                >
                  Launch Test Sequence
                </Button>
              </div>
            </div>
          </GlassPanel>

          {/* Leaderboard Preview */}
          <GlassPanel className="p-6">
            <h3 className="text-2xl font-semibold mb-4 text-cyan-400">Leaderboard of Innovators</h3>
            <p className="text-gray-400 mb-6">Weekly ranking of the most active Web3 testers</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-black">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-400">0x1234...5678</p>
                    <p className="text-sm text-gray-400">156 tests completed</p>
                  </div>
                </div>
                <div className="text-yellow-400 font-bold">🏆</div>
              </div>
              
              <div className="text-center py-8 text-gray-500">
                <p>Connect your wallet and start testing to join the leaderboard!</p>
              </div>
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
};

export default Index;
