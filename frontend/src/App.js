import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';
import Navbar from './Components/Navbar';
import Profile from './Pages/Profile';
import Dashboard from './Pages/Dashboard/Dashboard';
import Inventory from './Pages/inventory/Inventory';
import Orders from './Pages/Orders';
import Supplier from './Pages/Supplier/Supplier';
import Reports from './Pages/Reports';
import Login from './Pages/Auth/login';
import Signup from './Pages/Auth/Signup';
import ProtectedRoute from './Components/ProtectedRoute';
import PublicRoute from './Components/PublicRoute';
import { AuthProvider, useAuth } from './Context/AuthContext';
import Header from './Components/Header';

import Invoice from './Pages/invoice/Invoice'; // Make sure this file exists
import InvoiceDetails from './Pages/invoice/InvoiceDetails';
import BarcodePrinter from './Components/BarcodePrinter';

function AppWrapper() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  const hideNavbarPaths = ['/login', '/signup'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
    );
  }

  return (
    <>
      {!shouldHideNavbar && (
        <>
          <Navbar />
          <Header />
        </>
      )}

      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier"
          element={
            <ProtectedRoute>
              <Supplier />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoice"
          element={
            <ProtectedRoute>
              <Invoice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoice/:billNumber"
          element={
            <ProtectedRoute>
              <InvoiceDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/barcode-printer"
          element={
            <ProtectedRoute>
              <BarcodePrinter />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <AppWrapper />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
