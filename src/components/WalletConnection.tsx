
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Wallet, Loader2 } from 'lucide-react';

interface WalletConnectionProps {
  onConnect: (address: string) => void;
  isConnected: boolean;
  address: string;
  variant?: 'default' | 'hero';
}

export const WalletConnection = ({ 
  onConnect, 
  isConnected, 
  address, 
  variant = 'default' 
}: WalletConnectionProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          // Simulate loading sequence with more dramatic timing
          await new Promise(resolve => setTimeout(resolve, 2500));
          onConnect(accounts[0]);
        }
      } else {
        alert('Please install MetaMask to connect your wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    onConnect('');
    window.location.reload();
  };

  if (isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="flex items-center space-x-3"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-lg border border-green-500/30 backdrop-blur-sm"
        >
          <div className="flex items-center space-x-2">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-400 rounded-full"
            />
            <span className="text-sm font-mono text-green-400 font-semibold">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={disconnect}
            variant="outline"
            size="sm"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 font-semibold"
          >
            Disconnect
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  if (isConnecting) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 150 }}
        className={cn(
          "flex items-center space-x-4 px-6 py-3 rounded-xl",
          "bg-gradient-to-r from-cyan-500/20 to-purple-500/20",
          "border border-cyan-500/30 backdrop-blur-sm"
        )}
      >
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-cyan-400 rounded-full"
            />
          ))}
        </div>
        <span className="text-cyan-400 font-semibold">
          Establishing Connection...
        </span>
        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
      </motion.div>
    );
  }

  const buttonContent = variant === 'hero' ? (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      <Button
        onClick={connectWallet}
        size="lg"
        className={cn(
          "px-10 py-5 text-xl font-bold relative overflow-hidden",
          "bg-gradient-to-r from-cyan-500 to-purple-600",
          "hover:from-cyan-600 hover:to-purple-700",
          "shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40",
          "transition-all duration-300 border border-cyan-400/30"
        )}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
          animate={{ x: [-100, 100] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
        <div className="flex items-center space-x-3 relative z-10">
          <motion.div 
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-md flex items-center justify-center"
          >
            <Wallet className="w-4 h-4 text-white" />
          </motion.div>
          <span>Launch Mission Control</span>
        </div>
      </Button>
    </motion.div>
  ) : (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        onClick={connectWallet}
        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 font-semibold border border-cyan-400/30"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {buttonContent}
    </AnimatePresence>
  );
};

// Add global types for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
