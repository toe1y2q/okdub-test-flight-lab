
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Palette, Upload, Sparkles } from 'lucide-react';

const NFTMinter = () => {
  const [isMinting, setIsMinting] = useState(false);
  const [nftData, setNftData] = useState({
    name: '',
    description: '',
    image: null as File | null
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNftData(prev => ({ ...prev, image: file }));
    }
  };

  const mintNFT = async () => {
    if (!nftData.name || !nftData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsMinting(true);

    try {
      let imageUrl = '';

      // Upload image if provided
      if (nftData.image) {
        const fileExt = nftData.image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('nft-images')
          .upload(fileName, nftData.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('nft-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Create NFT mint record
      const { data, error } = await supabase
        .from('nft_mints')
        .insert({
          name: nftData.name,
          description: nftData.description,
          image_url: imageUrl,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('NFT minting initiated!');

      // Simulate minting process
      setTimeout(async () => {
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        const mockTokenId = Math.floor(Math.random() * 10000).toString();
        
        await supabase
          .from('nft_mints')
          .update({
            status: 'completed',
            tx_hash: mockTxHash,
            token_id: mockTokenId,
            minted_at: new Date().toISOString()
          })
          .eq('id', data.id);

        toast.success(`NFT minted successfully! Token ID: ${mockTokenId}`);
        
        // Reset form
        setNftData({ name: '', description: '', image: null });
        setIsMinting(false);
      }, 4000);

    } catch (error: any) {
      console.error('Minting error:', error);
      toast.error('Minting failed: ' + error.message);
      setIsMinting(false);
    }
  };

  return (
    <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
      <div className="flex items-center space-x-3 mb-6">
        <Palette className="w-6 h-6 text-purple-400" />
        <h3 className="text-2xl font-bold text-purple-400">NFT Minting Forge</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">NFT Name *</label>
          <Input
            value={nftData.name}
            onChange={(e) => setNftData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="My Awesome NFT"
            className="bg-slate-800/50 border-slate-700 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
          <Textarea
            value={nftData.description}
            onChange={(e) => setNftData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your NFT..."
            className="bg-slate-800/50 border-slate-700 text-white min-h-[100px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Image (Optional)</label>
          <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-gray-400">
                {nftData.image ? nftData.image.name : 'Click to upload image'}
              </span>
            </label>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={mintNFT}
            disabled={isMinting}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-semibold py-3"
          >
            {isMinting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Minting NFT...
              </div>
            ) : (
              <div className="flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Mint NFT
              </div>
            )}
          </Button>
        </motion.div>
      </div>
    </Card>
  );
};

export default NFTMinter;
