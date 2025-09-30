import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Proposals from "./pages/Proposals";
import Projects from "./pages/Projects";
import ReusableData from "./pages/ReusableData";
import Statistics from "./pages/Statistics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/proposals" replace />} />
          <Route path="/proposals" element={<Layout><Proposals /></Layout>} />
          <Route path="/projects" element={<Layout><Projects /></Layout>} />
          <Route path="/reusable-data" element={<Layout><ReusableData /></Layout>} />
          <Route path="/statistics" element={<Layout><Statistics /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
