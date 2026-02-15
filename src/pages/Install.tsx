
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Starfield } from '@/components/Starfield';
import { Download, Smartphone, Monitor, ArrowLeft, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-poppins">
      <Starfield />
      <div className="relative z-10 p-6 max-w-2xl mx-auto">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <h1 className="text-4xl font-bold mb-3 text-cyan-400">Install Okdub</h1>
        <p className="text-gray-400 mb-8">Get the full app experience on your device.</p>

        {isInstalled ? (
          <Card className="p-8 backdrop-blur-xl bg-white/5 border border-green-500/30 text-center">
            <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-400 mb-2">Already Installed!</h2>
            <p className="text-gray-400">Okdub is installed on your device.</p>
          </Card>
        ) : deferredPrompt ? (
          <Card className="p-8 backdrop-blur-xl bg-white/5 border border-cyan-500/30 text-center">
            <Download className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Ready to Install</h2>
            <Button
              onClick={handleInstall}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-lg px-8 py-3"
            >
              <Download className="w-5 h-5 mr-2" /> Install Now
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <div className="flex items-start space-x-4">
                <Smartphone className="w-8 h-8 text-cyan-400 mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-2">Mobile (iOS/Android)</h3>
                  <ol className="text-gray-400 space-y-2 text-sm list-decimal list-inside">
                    <li>Open this site in Safari (iOS) or Chrome (Android)</li>
                    <li>Tap the <strong>Share</strong> button (iOS) or <strong>⋮ Menu</strong> (Android)</li>
                    <li>Select <strong>"Add to Home Screen"</strong></li>
                    <li>Tap <strong>"Add"</strong> to confirm</li>
                  </ol>
                </div>
              </div>
            </Card>

            <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
              <div className="flex items-start space-x-4">
                <Monitor className="w-8 h-8 text-purple-400 mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-2">Desktop (Chrome/Edge)</h3>
                  <ol className="text-gray-400 space-y-2 text-sm list-decimal list-inside">
                    <li>Click the install icon in the address bar</li>
                    <li>Or open <strong>⋮ Menu → Install Okdub Casino</strong></li>
                    <li>Click <strong>"Install"</strong> to confirm</li>
                  </ol>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Install;
