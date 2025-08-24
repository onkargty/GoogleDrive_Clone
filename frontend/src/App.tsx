import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DriveProvider } from './contexts/DriveContext';
import AuthPage from './pages/AuthPage';
import DrivePage from './pages/DrivePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <DriveProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/drive/*"
              element={
                <ProtectedRoute>
                  <DrivePage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/drive" replace />} />
          </Routes>
        </div>
      </DriveProvider>
    </AuthProvider>
  );
}

export default App;