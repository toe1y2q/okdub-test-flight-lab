import { useState } from "react"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
}

export const LazyImage = ({ src, alt, className, containerClassName }: LazyImageProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  return (
    <div className={`relative ${containerClassName}`}>
      {isLoading && (
        <Skeleton className="absolute inset-0 bg-white/10 animate-shimmer" />
      )}
      
      {hasError ? (
        <div className="flex items-center justify-center bg-muted rounded-lg h-full min-h-[100px]">
          <span className="text-muted-foreground text-sm">Failed to load</span>
        </div>
      ) : (
        <motion.img
          src={src}
          alt={alt}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  )
}