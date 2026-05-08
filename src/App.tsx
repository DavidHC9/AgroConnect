import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import JobMatching from './pages/JobMatching';
import Marketplace from './pages/Marketplace';
import Academy from './pages/Academy';
import FieldBook from './pages/FieldBook';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import './App.css';

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', height: '100vh',
        background: '#f5f5f5', flexDirection: 'column', gap: '16px'
      }}>
        <div style={{
          width: '48px', height: '48px', border: '4px solid #e8f5e9',
          borderTop: '4px solid #2e7d32', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#2e7d32', fontWeight: 600 }}>Cargando AgroConnect...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <div className="app-container">
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Rutas privadas (requieren sesión) */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/jobs" element={<PrivateRoute><JobMatching /></PrivateRoute>} />
        <Route path="/marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
        <Route path="/academy" element={<PrivateRoute><Academy /></PrivateRoute>} />
        <Route path="/field-book" element={<PrivateRoute><FieldBook /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
