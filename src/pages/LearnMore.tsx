import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Zap, 
  Shield, 
  Coins, 
  TrendingUp, 
  Users, 
  Star,
  CheckCircle,
  Gamepad2,
  Target,
  Award,
  Clock
} from 'lucide-react';
import { Starfield } from '@/components/Starfield';

const LearnMore = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Gamepad2,
      title: "Web3 Gaming Platform",
      description: "Experience the future of gaming with play-to-earn mechanics, NFT rewards, and blockchain-based achievements.",
      benefits: ["Real cryptocurrency rewards", "Own your in-game assets", "Trade with other players"]
    },
    {
      icon: Shield,
      title: "Secure Testing Environment",
      description: "Safe testnet environment for all blockchain transactions with enterprise-grade security.",
      benefits: ["Zero risk testing", "Professional-grade security", "Real-time monitoring"]
    },
    {
      icon: Target,
      title: "Smart Contract Testing",
      description: "Comprehensive testing tools for smart contracts with automated security analysis.",
      benefits: ["Automated vulnerability scanning", "Gas optimization", "Real-time debugging"]
    },
    {
      icon: Award,
      title: "NFT Marketplace",
      description: "Create, buy, and sell unique digital assets in our vibrant NFT marketplace.",
      benefits: ["Low transaction fees", "Creator royalties", "Multi-chain support"]
    }
  ];

  const stats = [
    { label: "Active Users", value: "50,000+", icon: Users },
    { label: "Tests Completed", value: "1M+", icon: CheckCircle },
    { label: "Total Rewards", value: "$2.5M", icon: Coins },
    { label: "Uptime", value: "99.9%", icon: Clock }
  ];

  const roadmap = [
    {
      phase: "Phase 1",
      title: "Foundation",
      items: ["Platform Launch", "Basic Testing Tools", "User Authentication"],
      status: "completed"
    },
    {
      phase: "Phase 2", 
      title: "Gaming Integration",
      items: ["NFT Marketplace", "Gaming Rewards", "Staking System"],
      status: "completed"
    },
    {
      phase: "Phase 3",
      title: "Advanced Features",
      items: ["Cross-chain Support", "Advanced Analytics", "Mobile App"],
      status: "in-progress"
    },
    {
      phase: "Phase 4",
      title: "Expansion",
      items: ["DAO Governance", "Enterprise Tools", "Global Expansion"],
      status: "planned"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-poppins">
      <Starfield />
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex justify-between items-center p-6 backdrop-blur-sm"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center"
          >
            <Zap className="w-6 h-6 text-white" />
          </motion.div>
          <span className="text-3xl font-bold gradient-text">
            Okdub Casino
          </span>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
            className="border-glass-border/30 hover:bg-glass/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-primary hover:bg-primary/90"
          >
            Get Started
          </Button>
        </div>
      </motion.nav>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            The Future of Web3 Development
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Okdub Casino is more than just a platform - it's a comprehensive ecosystem for 
            Web3 developers, gamers, and creators to build, test, and thrive in the decentralized future.
          </p>
          <Button
            onClick={() => navigate('/auth')}
            size="lg"
            className="px-8 py-4 bg-primary hover:bg-primary/90 purple-glow"
          >
            <Star className="w-5 h-5 mr-2" />
            Start Your Journey
          </Button>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="glass-morphism p-6 rounded-xl text-center"
            >
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">
            Powerful Features for Every User
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-morphism p-6 rounded-xl"
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Roadmap Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">
            Development Roadmap
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmap.map((phase, index) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                className={`glass-morphism p-6 rounded-xl relative ${
                  phase.status === 'completed' ? 'border-green-500/30' :
                  phase.status === 'in-progress' ? 'border-primary/30' :
                  'border-glass-border/20'
                }`}
              >
                <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                  phase.status === 'completed' ? 'bg-green-500' :
                  phase.status === 'in-progress' ? 'bg-primary' :
                  'bg-muted-foreground/30'
                }`} />
                <h3 className="text-lg font-semibold text-foreground mb-2">{phase.phase}</h3>
                <h4 className="text-primary font-medium mb-3">{phase.title}</h4>
                <ul className="space-y-2">
                  {phase.items.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        phase.status === 'completed' ? 'bg-green-500' :
                        phase.status === 'in-progress' ? 'bg-primary' :
                        'bg-muted-foreground/30'
                      }`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Card className="glass-morphism p-8 md:p-12 rounded-2xl max-w-4xl mx-auto border-glass-border/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
              Ready to Join the Future?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers and creators building the next generation of Web3 applications. 
              Start your journey today and be part of the revolution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/auth')}
                size="lg"
                className="px-8 py-4 bg-primary hover:bg-primary/90 purple-glow"
              >
                <Gamepad2 className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
              <Button
                onClick={() => navigate('/pricing')}
                variant="outline"
                size="lg"
                className="px-8 py-4 border-glass-border/30 hover:bg-glass/20"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                View Pricing
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LearnMore;