import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { Navbar } from '../../features/navigation/components/Navbar';
import { LoginPage } from '../../features/auth/components/LoginPage';
import { RegisterPage } from '../../features/auth/components/RegisterPage';
import { ProfilePage } from '../../features/profile/components/ProfilePage';
import { TransactionsPage } from '../../features/transactions/components/TransactionsPage';
import { CategoriesPage } from '../../features/categories/components/CategoriesPage';
import { StatisticsPage } from '../../features/statistics/components/StatisticsPage';

function PrivateLayout({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  
  // Если не авторизован — отправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="container">{children}</main>
    </>
  );
}

export function AppRouter() {
  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Защищённые маршруты */}
      <Route
        path="/"
        element={
          <PrivateLayout>
            <Navigate to="/transactions/expense" replace />
          </PrivateLayout>
        }
      />
      <Route
        path="/transactions/:type"
        element={
          <PrivateLayout>
            <TransactionsPage />
          </PrivateLayout>
        }
      />
      <Route
        path="/categories/:type"
        element={
          <PrivateLayout>
            <CategoriesPage />
          </PrivateLayout>
        }
      />
      <Route
        path="/statistics"
        element={
          <PrivateLayout>
            <StatisticsPage />
          </PrivateLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateLayout>
            <ProfilePage />
          </PrivateLayout>
        }
      />

      {/* Всё остальное — на главную */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}