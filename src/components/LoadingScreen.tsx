interface LoadingScreenProps {
  message?: string
}

export const LoadingScreen = ({ message = "Loading..." }: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <img 
          src="/lovable-uploads/3e7c2c9a-0c07-4a59-afbc-c68bc09a5223.png" 
          alt="Casino Logo"
          className="w-24 h-24 mx-auto"
        />
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-muted-foreground font-medium">{message}</p>
        <div className="w-64 mx-auto">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 animate-[slide_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    </div>
  )
}
