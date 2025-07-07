
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
          // Simulate loading sequence
          await new Promise(resolve => setTimeout(resolve, 2000));
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-3"
      >
        <div className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-lg border border-green-500/30">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-mono text-green-400">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
        </div>
        <Button
          onClick={disconnect}
          variant="outline"
          size="sm"
          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          Disconnect
        </Button>
      </motion.div>
    );
  }

  if (isConnecting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "flex items-center space-x-3 px-6 py-3 rounded-xl",
          "bg-gradient-to-r from-cyan-500/20 to-purple-500/20",
          "border border-cyan-500/30"
        )}
      >
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
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
      </motion.div>
    );
  }

  const buttonContent = variant === 'hero' ? (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={connectWallet}
        size="lg"
        className={cn(
          "px-8 py-4 text-lg font-semibold",
          "bg-gradient-to-r from-cyan-500 to-purple-600",
          "hover:from-cyan-600 hover:to-purple-700",
          "shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40",
          "transition-all duration-300"
        )}
      >
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gradient-to-r from-orange-400 to-yellow-500 rounded" />
          <span>Launch Mission Control</span>
        </div>
      </Button>
    </motion.div>
  ) : (
    <Button
      onClick={connectWallet}
      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
    >
      Connect Wallet
    </Button>
  );

  return buttonContent;
};

// Add global types for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
