
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { usePageTransition } from "@/hooks/usePageTransition";
import { PageLoader } from "@/components/PageLoader";
import { lazy, Suspense } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NFTBalance = lazy(() => import("./pages/NFTBalance"));
const Rewards = lazy(() => import("./pages/Rewards"));
const Settings = lazy(() => import("./pages/Settings"));
const Balance = lazy(() => import("./pages/Balance"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Projects = lazy(() => import("./pages/Projects"));
const BugBounties = lazy(() => import("./pages/BugBounties"));
const BugBountiesView = lazy(() => import("./pages/BugBountiesView"));
const NFTDetail = lazy(() => import("./pages/NFTDetail"));
const NFTCreator = lazy(() => import("./pages/NFTCreator"));
const Cart = lazy(() => import("./pages/Cart"));
const Payment = lazy(() => import("./pages/Payment"));
const BountyCompletion = lazy(() => import("./pages/BountyCompletion"));
const BountyReview = lazy(() => import("./pages/BountyReview"));
const Pricing = lazy(() => import("./pages/Pricing"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SolanaWithdrawal = lazy(() => import("./pages/SolanaWithdrawal"));
const CurrencyDeposit = lazy(() => import("./pages/CurrencyDeposit"));
const Mining = lazy(() => import("./pages/Mining"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes for better caching
      gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
      refetchOnWindowFocus: false,
      retry: 1, // Reduce retries for faster failure
    },
  },
});

const AnimatedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = usePageTransition();

  if (isLoading) {
    return <PageLoader message="Loading page..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <Suspense fallback={<LoadingScreen message="Loading page..." />}>
        {children}
      </Suspense>
    </motion.div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<AnimatedRoute><Index /></AnimatedRoute>} />
            <Route path="/auth" element={<AnimatedRoute><Auth /></AnimatedRoute>} />
            <Route path="/dashboard" element={<AnimatedRoute><Dashboard /></AnimatedRoute>} />
            <Route path="/nfts" element={<AnimatedRoute><NFTBalance /></AnimatedRoute>} />
            <Route path="/nft/:id" element={<AnimatedRoute><NFTDetail /></AnimatedRoute>} />
            <Route path="/nft-creator" element={<AnimatedRoute><NFTCreator /></AnimatedRoute>} />
            <Route path="/rewards" element={<AnimatedRoute><Rewards /></AnimatedRoute>} />
            <Route path="/settings" element={<AnimatedRoute><Settings /></AnimatedRoute>} />
            <Route path="/balance" element={<AnimatedRoute><Balance /></AnimatedRoute>} />
            <Route path="/withdrawal" element={<AnimatedRoute><SolanaWithdrawal /></AnimatedRoute>} />
            <Route path="/currency-deposit" element={<AnimatedRoute><CurrencyDeposit /></AnimatedRoute>} />
            <Route path="/mining" element={<AnimatedRoute><Mining /></AnimatedRoute>} />
            <Route path="/marketplace" element={<AnimatedRoute><Marketplace /></AnimatedRoute>} />
            <Route path="/projects" element={<AnimatedRoute><Projects /></AnimatedRoute>} />
            <Route path="/bounties" element={<AnimatedRoute><BugBounties /></AnimatedRoute>} />
            <Route path="/bug-bounties" element={<AnimatedRoute><BugBountiesView /></AnimatedRoute>} />
            <Route path="/bounty/:id/complete" element={<AnimatedRoute><BountyCompletion /></AnimatedRoute>} />
            <Route path="/bounty/:id/review" element={<AnimatedRoute><BountyReview /></AnimatedRoute>} />
            <Route path="/pricing" element={<AnimatedRoute><Pricing /></AnimatedRoute>} />
            <Route path="/cart" element={<AnimatedRoute><Cart /></AnimatedRoute>} />
            <Route path="/payment" element={<AnimatedRoute><Payment /></AnimatedRoute>} />
            <Route path="*" element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
