
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

export const GlassPanel = ({ children, className }: GlassPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -3,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      transition={{ duration: 0.4 }}
      className={cn(
        "backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl shadow-2xl",
        "hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-500",
        "relative overflow-hidden group",
        className
      )}
    >
      {/* Enhanced glow effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
        animate={{
          background: [
            "linear-gradient(90deg, rgba(6,182,212,0.05) 0%, rgba(147,51,234,0.05) 50%, rgba(6,182,212,0.05) 100%)",
            "linear-gradient(90deg, rgba(147,51,234,0.05) 0%, rgba(6,182,212,0.05) 50%, rgba(147,51,234,0.05) 100%)",
            "linear-gradient(90deg, rgba(6,182,212,0.05) 0%, rgba(147,51,234,0.05) 50%, rgba(6,182,212,0.05) 100%)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* Enhanced grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
        <div className="w-full h-full cyber-grid" />
      </div>

      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-xl border border-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 font-poppins">
        {children}
      </div>
    </motion.div>
  );
};
