import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TiersPage } from './pages/TiersPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { AssessmentDetailPage } from './pages/AssessmentDetailPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tiers"
          element={
            <ProtectedRoute>
              <TiersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="assessments"
          element={
            <ProtectedRoute>
              <AssessmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="assessments/:id"
          element={
            <ProtectedRoute>
              <AssessmentDetailPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;




