import { motion } from "framer-motion"
import { Spinner } from "@/components/ui/spinner"

interface PageLoaderProps {
  message?: string
  fullScreen?: boolean
}

export const PageLoader = ({ message = "Loading...", fullScreen = false }: PageLoaderProps) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center space-y-4 p-8"
    >
      <div className="relative">
        <Spinner size="lg" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground text-sm font-medium"
      >
        {message}
      </motion.p>
    </motion.div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center">
        {content}
      </div>
    )
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      {content}
    </div>
  )
}