
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Starfield } from '@/components/Starfield';
import { ArrowLeft, Wallet, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface WalletStatus {
  name: string;
  detected: boolean;
  connected: boolean;
  address: string | null;
  network: string | null;
  icon: string;
}

const WalletHealth = () => {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<WalletStatus[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const detectWallets = useCallback(async () => {
    const results: WalletStatus[] = [];

    // MetaMask
    const ethereum = (window as any).ethereum;
    const metamaskDetected = !!ethereum?.isMetaMask;
    let metamaskAddress: string | null = null;
    let metamaskNetwork: string | null = null;
    if (metamaskDetected) {
      try {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts?.length > 0) {
          metamaskAddress = accounts[0];
          const chainId = await ethereum.request({ method: 'eth_chainId' });
          metamaskNetwork = `Chain ${parseInt(chainId, 16)}`;
        }
      } catch {}
    }
    results.push({
      name: 'MetaMask',
      detected: metamaskDetected,
      connected: !!metamaskAddress,
      address: metamaskAddress,
      network: metamaskNetwork,
      icon: '🦊',
    });

    // Phantom (Solana)
    const phantom = (window as any).solana;
    const phantomDetected = !!phantom?.isPhantom;
    let phantomAddress: string | null = null;
    if (phantomDetected && phantom.isConnected) {
      phantomAddress = phantom.publicKey?.toString() || null;
    }
    results.push({
      name: 'Phantom (Solana)',
      detected: phantomDetected,
      connected: !!phantomAddress,
      address: phantomAddress,
      network: phantomAddress ? 'Solana Mainnet' : null,
      icon: '👻',
    });

    // TonConnect placeholder
    results.push({
      name: 'TonConnect',
      detected: false,
      connected: false,
      address: null,
      network: null,
      icon: '💎',
    });

    setWallets(results);
  }, []);

  useEffect(() => {
    detectWallets();
  }, [detectWallets]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await detectWallets();
    setRefreshing(false);
    toast.success('Wallet status refreshed');
  };

  const connectMetaMask = async () => {
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        window.open('https://metamask.io/download/', '_blank');
        return;
      }
      await ethereum.request({ method: 'eth_requestAccounts' });
      await detectWallets();
      toast.success('MetaMask connected');
    } catch {
      toast.error('MetaMask connection rejected');
    }
  };

  const connectPhantom = async () => {
    try {
      const phantom = (window as any).solana;
      if (!phantom) {
        window.open('https://phantom.app/', '_blank');
        return;
      }
      await phantom.connect();
      await detectWallets();
      toast.success('Phantom connected');
    } catch {
      toast.error('Phantom connection rejected');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-poppins">
      <Starfield />
      <div className="relative z-10 p-6 max-w-3xl mx-auto">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6 text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400">Wallet Health</h1>
            <p className="text-gray-400">Real-time connection status for your wallets</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="border-cyan-400/30 text-cyan-400">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {wallets.map(wallet => (
            <Card key={wallet.name} className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">{wallet.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold">{wallet.name}</h3>
                    {wallet.name === 'TonConnect' ? (
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">Coming Soon</Badge>
                    ) : !wallet.detected ? (
                      <p className="text-red-400 text-sm">Not installed</p>
                    ) : wallet.connected ? (
                      <div>
                        <p className="text-green-400 text-sm font-mono truncate max-w-[200px] sm:max-w-xs">{wallet.address}</p>
                        {wallet.network && <p className="text-gray-400 text-xs">{wallet.network}</p>}
                      </div>
                    ) : (
                      <p className="text-yellow-400 text-sm">Detected but not connected</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${wallet.connected ? 'bg-green-400 shadow-lg shadow-green-400/50' : wallet.detected ? 'bg-yellow-400' : 'bg-red-400'}`} />
                  {wallet.name === 'MetaMask' && !wallet.connected && (
                    <Button onClick={connectMetaMask} size="sm" className="bg-orange-500 hover:bg-orange-600">
                      {wallet.detected ? 'Connect' : 'Install'}
                    </Button>
                  )}
                  {wallet.name === 'Phantom (Solana)' && !wallet.connected && (
                    <Button onClick={connectPhantom} size="sm" className="bg-purple-500 hover:bg-purple-600">
                      {wallet.detected ? 'Connect' : 'Install'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletHealth;
