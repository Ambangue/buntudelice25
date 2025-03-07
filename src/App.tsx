
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Toaster } from './components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminDashboard from './pages/Admin';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Import all the page components
import Index from './pages/Index';
import Home from './pages/Home';
import OrderDemo from './pages/OrderDemo';
import Auth from './pages/Auth';
import Restaurants from './pages/Restaurants';
import RestaurantMenu from './pages/RestaurantMenu';
import Taxi from './pages/Taxi';
import TaxiRide from './pages/TaxiRide';
import Wallet from './pages/Wallet';
import PaymentMethods from './pages/wallet/PaymentMethods';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Covoiturage from './pages/Covoiturage';
import Messages from './pages/Messages';
import Explorer from './pages/Explorer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CartProvider>
          <OrderProvider>
            <Router>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/order-demo" element={<OrderDemo />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/restaurants" element={<Restaurants />} />
                    <Route path="/restaurants/:restaurantId" element={<RestaurantMenu />} />
                    <Route path="/taxi" element={<Taxi />} />
                    <Route path="/taxi/ride/:rideId" element={<TaxiRide />} />
                    <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                    <Route path="/wallet/payment-methods" element={<ProtectedRoute><PaymentMethods /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                    <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/covoiturage" element={<Covoiturage />} />
                    <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                    <Route path="/explorer" element={<Explorer />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
                <Toaster />
              </div>
            </Router>
          </OrderProvider>
        </CartProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
