import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  variant?: "primary" | "success" | "warning" | "danger"
}

export const LoadingSpinner = ({ 
  size = "md", 
  className,
  variant = "primary" 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  }

  const variantClasses = {
    primary: "border-primary",
    success: "border-green-500",
    warning: "border-yellow-500", 
    danger: "border-red-500"
  }

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={cn(
          "rounded-full border-2 border-muted border-t-transparent",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  )
}