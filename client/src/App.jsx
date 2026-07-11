import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import AddApplication from './pages/AddApplication';
import EditApplication from './pages/EditApplication';
import ApplicationDetails from './pages/ApplicationDetails';
import FollowUps from './pages/FollowUps';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import DsaTracker from './pages/DsaTracker';
import AddDsaProblem from './pages/AddDsaProblem';
import EditDsaProblem from './pages/EditDsaProblem';

// Wraps every private page with the persistent Navbar.
const PrivateLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

// Keeps a logged-in user from seeing the login/register forms again.
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage label="Loading..." />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PrivateLayout>
                <Dashboard />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <PrivateLayout>
                <Applications />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/new"
          element={
            <ProtectedRoute>
              <PrivateLayout>
                <AddApplication />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/:id"
          element={
            <ProtectedRoute>
              <PrivateLayout>
                <ApplicationDetails />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/:id/edit"
          element={
            <ProtectedRoute>
              <PrivateLayout>
                <EditApplication />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/follow-ups"
          element={
            <ProtectedRoute>
              <PrivateLayout>
                <FollowUps />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PrivateLayout>
                <Profile />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dsa"
          element={
            <ProtectedRoute>
              <PrivateLayout>
                <DsaTracker />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dsa/new"
          element={
            <ProtectedRoute>
              <PrivateLayout>
                <AddDsaProblem />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dsa/:id/edit"
          element={
            <ProtectedRoute>
              <PrivateLayout>
                <EditDsaProblem />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
