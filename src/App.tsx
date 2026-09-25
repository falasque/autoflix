import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { SiteConfigProvider } from "@/contexts/SiteConfigContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import DynamicStyles from "@/components/DynamicStyles";
import SEOManager from "@/components/SEOManager";
import GlobalSchemas from "@/components/GlobalSchemas";
// import { useSitemapRegenerator } from "@/hooks/use-sitemap-regenerator"; // DESABILITADO - CORS
import { analytics } from "@/lib/analytics";
import Index from "./pages/Index";
import VehicleDetails from "./pages/VehicleDetails";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Componente para rastrear mudanças de página
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Rastrear visualização de página
    analytics.trackPageView(location.pathname + location.search, document.title);
  }, [location]);

  return null;
};

// Componente para regenerar sitemap periodicamente (DESABILITADO - CORS)
/*
const SitemapRegenerator = () => {
  useSitemapRegenerator();
  return null;
};
*/

const App = () => {
  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('❌ Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminAuthProvider>
          <SiteConfigProvider>
            <DynamicStyles />
            <SEOManager />
            <GlobalSchemas />
            {/* <SitemapRegenerator /> */}
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <AnalyticsTracker />
              <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/veiculo/:slug" element={<VehicleDetails />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SiteConfigProvider>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
