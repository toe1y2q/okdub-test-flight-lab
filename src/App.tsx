
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NFTBalance from "./pages/NFTBalance";
import Rewards from "./pages/Rewards";
import Settings from "./pages/Settings";
import Balance from "./pages/Balance";
import Marketplace from "./pages/Marketplace";
import Projects from "./pages/Projects";
import BugBounties from "./pages/BugBounties";
import NFTDetail from "./pages/NFTDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/nfts" element={<NFTBalance />} />
          <Route path="/nft/:id" element={<NFTDetail />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/balance" element={<Balance />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/bounties" element={<BugBounties />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
