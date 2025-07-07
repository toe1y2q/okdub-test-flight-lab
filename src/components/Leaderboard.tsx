import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  total_tests: number;
  total_nfts: number;
  success_rate: number;
  points: number;
  weekly_points: number;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    wallet_address: string | null;
  } | null;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data: leaderboardData, error } = await supabase
        .from('leaderboard_stats')
        .select('*')
        .order('points', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Leaderboard query error:', error);
        throw error;
      }

      // Fetch profiles separately to avoid join issues
      const userIds = leaderboardData?.map(entry => entry.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, wallet_address')
        .in('id', userIds);

      if (profilesError) {
        console.error('Profiles query error:', profilesError);
      }

      // Combine the data
      const combinedData = leaderboardData?.map(entry => ({
        ...entry,
        profiles: profilesData?.find(profile => profile.id === entry.user_id) || null
      })) || [];
      
      setLeaderboard(combinedData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <TrendingUp className="w-6 h-6 text-cyan-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 2:
        return 'from-gray-400/20 to-gray-600/20 border-gray-400/30';
      case 3:
        return 'from-amber-600/20 to-yellow-600/20 border-amber-600/30';
      default:
        return 'from-cyan-500/10 to-purple-500/10 border-slate-700/50';
    }
  };

  if (loading) {
    return (
      <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-800/50 rounded-lg"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
      <div className="flex items-center space-x-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h3 className="text-2xl font-bold text-cyan-400">Web3 Testing Champions</h3>
      </div>

      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No champions yet!</p>
            <p className="text-sm">Start testing to claim your spot on the leaderboard.</p>
          </div>
        ) : (
          leaderboard.map((entry, index) => {
            const rank = index + 1;
            const displayName = entry.profiles?.first_name && entry.profiles?.last_name
              ? `${entry.profiles.first_name} ${entry.profiles.last_name}`
              : entry.profiles?.wallet_address?.slice(0, 6) + '...' + entry.profiles?.wallet_address?.slice(-4) || 'Anonymous';

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className={`flex items-center justify-between p-4 rounded-lg border backdrop-blur-sm bg-gradient-to-r ${getRankColor(rank)}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/50">
                    {getRankIcon(rank)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{displayName}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{entry.total_tests} tests</span>
                      <span>{entry.total_nfts} NFTs</span>
                      <span>{entry.success_rate}% success</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-cyan-400">{entry.points}</p>
                  <p className="text-sm text-gray-400">points</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default Leaderboard;
