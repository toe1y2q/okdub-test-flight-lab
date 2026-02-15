
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const LearnMore = lazy(() => import("./pages/LearnMore"));
const Install = lazy(() => import("./pages/Install"));
const Sandbox = lazy(() => import("./pages/Sandbox"));
const WalletHealth = lazy(() => import("./pages/WalletHealth"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const P = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingScreen message="Loading page..." />}>
    {children}
  </Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<P><Index /></P>} />
          <Route path="/auth" element={<P><Auth /></P>} />
          <Route path="/dashboard" element={<P><Dashboard /></P>} />
          <Route path="/nfts" element={<P><NFTBalance /></P>} />
          <Route path="/nft/:id" element={<P><NFTDetail /></P>} />
          <Route path="/nft-creator" element={<P><NFTCreator /></P>} />
          <Route path="/rewards" element={<P><Rewards /></P>} />
          <Route path="/settings" element={<P><Settings /></P>} />
          <Route path="/balance" element={<P><Balance /></P>} />
          <Route path="/withdrawal" element={<P><SolanaWithdrawal /></P>} />
          <Route path="/currency-deposit" element={<P><CurrencyDeposit /></P>} />
          <Route path="/mining" element={<P><Mining /></P>} />
          <Route path="/marketplace" element={<P><Marketplace /></P>} />
          <Route path="/projects" element={<P><Projects /></P>} />
          <Route path="/bounties" element={<P><BugBounties /></P>} />
          <Route path="/bug-bounties" element={<P><BugBountiesView /></P>} />
          <Route path="/bounty/:id/complete" element={<P><BountyCompletion /></P>} />
          <Route path="/bounty/:id/review" element={<P><BountyReview /></P>} />
          <Route path="/pricing" element={<P><Pricing /></P>} />
          <Route path="/cart" element={<P><Cart /></P>} />
          <Route path="/payment" element={<P><Payment /></P>} />
          <Route path="/payment-success" element={<P><PaymentSuccess /></P>} />
          <Route path="/learn-more" element={<P><LearnMore /></P>} />
          <Route path="/install" element={<P><Install /></P>} />
          <Route path="/sandbox" element={<P><Sandbox /></P>} />
          <Route path="/wallet-health" element={<P><WalletHealth /></P>} />
          <Route path="*" element={<P><NotFound /></P>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
