
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Palette, Upload, Sparkles, X, Plus, Image, CheckCircle, AlertCircle } from 'lucide-react';

const categories = [
  'Art', 'Photography', 'Music', 'Video', 'Gaming', 'Sports', 'Collectibles', 'Utility', 'PFP', 'Memes'
];

const ImprovedNFTMinter = () => {
  const { user } = useAuth();
  const [isMinting, setIsMinting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [nftData, setNftData] = useState({
    name: '',
    description: '',
    category: '',
    image: null as File | null,
    isLimitedEdition: false,
    editionSize: 1,
    royalty: 5.0
  });

  const [validations, setValidations] = useState({
    name: true,
    description: true,
    category: true,
    image: true
  });

  const validateForm = () => {
    const newValidations = {
      name: nftData.name.trim().length >= 3,
      description: nftData.description.trim().length >= 10,
      category: nftData.category !== '',
      image: nftData.image !== null
    };
    
    setValidations(newValidations);
    return Object.values(newValidations).every(v => v);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setNftData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const awardPointsForNFT = async (userId: string) => {
    try {
      const pointsToAward = 100;

      const { data: currentStats, error: fetchError } = await supabase
        .from('leaderboard_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching current stats:', fetchError);
        return;
      }

      const { error: updateError } = await supabase
        .from('leaderboard_stats')
        .update({
          total_nfts: currentStats.total_nfts + 1,
          points: currentStats.points + pointsToAward,
          weekly_points: currentStats.weekly_points + pointsToAward,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating stats:', updateError);
        return;
      }

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          transaction_type: 'earned_points',
          amount: 0,
          points_amount: pointsToAward,
          status: 'completed',
          description: `Earned ${pointsToAward} points for minting NFT`,
          completed_at: new Date().toISOString()
        });

      if (transactionError) {
        console.error('Error recording transaction:', transactionError);
      } else {
        toast.success(`+${pointsToAward} points earned for NFT mint!`);
      }
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

  const mintNFT = async () => {
    if (!user) {
      toast.error('Please sign in to mint NFTs');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsMinting(true);

    try {
      let imageUrl = '';

      // Upload image
      if (nftData.image) {
        const fileExt = nftData.image.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
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
          user_id: user.id,
          name: nftData.name.trim(),
          description: nftData.description.trim(),
          category: nftData.category,
          image_url: imageUrl,
          tags: tags.length > 0 ? tags : null,
          is_limited_edition: nftData.isLimitedEdition,
          edition_size: nftData.isLimitedEdition ? nftData.editionSize : null,
          creator_royalty: nftData.royalty,
          status: 'pending',
          original_creator_id: user.id,
          current_owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('NFT minting initiated!');
      setCurrentStep(3); // Move to success step

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

        // Award points for successful NFT mint
        await awardPointsForNFT(user.id);

        toast.success(`NFT minted successfully! Token ID: ${mockTokenId}`);
        
        // Reset form
        resetForm();
      }, 4000);

    } catch (error: any) {
      console.error('Minting error:', error);
      toast.error('Minting failed: ' + error.message);
      setIsMinting(false);
    }
  };

  const resetForm = () => {
    setNftData({
      name: '',
      description: '',
      category: '',
      image: null,
      isLimitedEdition: false,
      editionSize: 1,
      royalty: 5.0
    });
    setTags([]);
    setNewTag('');
    setImagePreview(null);
    setCurrentStep(1);
    setIsMinting(false);
    setValidations({ name: true, description: true, category: true, image: true });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (nftData.name.trim().length >= 3 && nftData.description.trim().length >= 10) {
        setCurrentStep(2);
      } else {
        toast.error('Please complete all required fields');
      }
    }
  };

  if (currentStep === 3) {
    return (
      <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold text-green-400 mb-2">NFT Minting In Progress!</h3>
            <p className="text-gray-400">Your NFT is being minted on the blockchain. This may take a few moments.</p>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 4 }}
              />
            </div>
            <p className="text-sm text-gray-500">Processing transaction...</p>
          </div>
          <Button
            onClick={resetForm}
            variant="outline"
            className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
          >
            Mint Another NFT
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
      <div className="flex items-center space-x-3 mb-6">
        <Palette className="w-6 h-6 text-purple-400" />
        <h3 className="text-2xl font-bold text-purple-400">Advanced NFT Minting</h3>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-cyan-400' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-cyan-400/20 border-2 border-cyan-400' : 'bg-gray-700 border-2 border-gray-600'}`}>
            1
          </div>
          <span className="text-sm font-medium">Details</span>
        </div>
        <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-cyan-400' : 'bg-gray-600'}`} />
        <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-cyan-400' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-cyan-400/20 border-2 border-cyan-400' : 'bg-gray-700 border-2 border-gray-600'}`}>
            2
          </div>
          <span className="text-sm font-medium">Media & Settings</span>
        </div>
      </div>

      {currentStep === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">NFT Name *</label>
            <Input
              value={nftData.name}
              onChange={(e) => setNftData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="My Awesome NFT"
              className={`bg-slate-800/50 border-slate-700 text-white ${!validations.name ? 'border-red-500' : ''}`}
            />
            {!validations.name && (
              <p className="text-red-400 text-xs mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Name must be at least 3 characters
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
            <Textarea
              value={nftData.description}
              onChange={(e) => setNftData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your NFT in detail..."
              className={`bg-slate-800/50 border-slate-700 text-white min-h-[120px] ${!validations.description ? 'border-red-500' : ''}`}
            />
            <div className="flex justify-between mt-1">
              {!validations.description ? (
                <p className="text-red-400 text-xs flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Description must be at least 10 characters
                </p>
              ) : (
                <span />
              )}
              <span className="text-xs text-gray-500">{nftData.description.length}/500</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
            <Select value={nftData.category} onValueChange={(value) => setNftData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className={`bg-slate-800/50 border-slate-700 text-white ${!validations.category ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!validations.category && (
              <p className="text-red-400 text-xs mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Please select a category
              </p>
            )}
          </div>

          <Button
            onClick={nextStep}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 font-semibold"
          >
            Continue to Media Upload
          </Button>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <Button
            onClick={() => setCurrentStep(1)}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-400 hover:bg-gray-700 mb-4"
          >
            ← Back
          </Button>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">NFT Image *</label>
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
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="NFT Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-gray-400">Click to upload image</span>
                    <span className="text-xs text-gray-500">Max 10MB • JPG, PNG, GIF</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags (Optional)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-purple-500/20 text-purple-300">
                  {tag}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                className="bg-slate-800/50 border-slate-700 text-white"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                disabled={tags.length >= 5}
              />
              <Button
                onClick={addTag}
                disabled={!newTag.trim() || tags.includes(newTag.trim()) || tags.length >= 5}
                variant="outline"
                size="sm"
                className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Maximum 5 tags</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Creator Royalty (%)</label>
            <Input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={nftData.royalty}
              onChange={(e) => setNftData(prev => ({ ...prev, royalty: parseFloat(e.target.value) || 0 }))}
              className="bg-slate-800/50 border-slate-700 text-white"
            />
            <p className="text-xs text-gray-500 mt-1">Royalty percentage for future sales (0-10%)</p>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={mintNFT}
              disabled={isMinting || !nftData.image}
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
                  Mint NFT (+100 points)
                </div>
              )}
            </Button>
          </motion.div>
        </div>
      )}
    </Card>
  );
};

export default ImprovedNFTMinter;
