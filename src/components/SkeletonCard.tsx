import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

interface SkeletonCardProps {
  className?: string
}

export const SkeletonCard = ({ className }: SkeletonCardProps) => {
  return (
    <Card className={`p-4 backdrop-blur-xl bg-white/5 border border-white/10 ${className}`}>
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-lg bg-white/10" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-20 bg-white/10" />
            <Skeleton className="h-6 w-16 bg-white/10" />
          </div>
        </div>
      </motion.div>
    </Card>
  )
}

export const SkeletonLoader = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <SkeletonCard />
        </motion.div>
      ))}
    </div>
  )
}