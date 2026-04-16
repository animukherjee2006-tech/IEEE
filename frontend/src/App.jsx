import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext'; // Socket context import karo

// Pages
import LandingPage from './pages/Landingpage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Browse from './pages/BrowseServices';
import ProviderDashboard from './pages/ProviderDashboard';
import AddService from './pages/AddSercice';
import ExploreProviders from './pages/ExploreProviders';
import CheckoutPage from './pages/CheckoutPage';
import ProviderProfile from './pages/ProviderProfile';
import UpdateProfile from './pages/UpdateProfile';
import ChatPage from './pages/ChatPage';

// Components
import ProtectedRoute from './components/ProctedRoutes';

function App() {
  return (
    <AuthProvider>
      {/* SocketProvider ko AuthProvider ke andar rakho taaki auth state socket ko mil sake */}
      <SocketProvider> 
        <BrowserRouter>
          <Routes>
            {/* ================= PUBLIC ROUTES ================= */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/explore" element={<ExploreProviders />} />
            <Route path="/provider/:providerId" element={<ProviderProfile />} />

            {/* ================= PROTECTED ROUTES (CONSUMER & SHARED) ================= */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/book/:serviceId"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            <Route 
              path='/profile' 
              element={
                <ProtectedRoute>
                  <UpdateProfile />
                </ProtectedRoute>
              } 
            />

            <Route 
              path='/chat/:bookingId' 
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } 
            />

            {/* ================= PROVIDER ROUTES ================= */}
            <Route
              path="/provider-dashboard"
              element={
                <ProtectedRoute>
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-service"
              element={
                <ProtectedRoute>
                  <AddService />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route (Optional) */}
            <Route path="*" element={<div style={{padding: '100px', textAlign: 'center', color: 'white'}}>404 - Page Not Found</div>} />
            
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;