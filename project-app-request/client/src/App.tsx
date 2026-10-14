import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { HomePage } from './pages/public/HomePage';
import { RequestFormPage } from './pages/public/RequestFormPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { RequestsPage } from './pages/admin/RequestsPage';
import { AccountSettingsPage } from './pages/admin/AccountSettingsPage';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import { DarkModeProvider } from './hooks/useDarkMode';

function App() {
  return (
    <DarkModeProvider>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/request" element={<RequestFormPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<DashboardPage />} />
                <Route path="/admin/requests" element={<RequestsPage />} />
                <Route path="/admin/settings" element={<AccountSettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </DarkModeProvider>
  );
}

export default App;
