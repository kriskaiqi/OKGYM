import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/Dashboard';
import ExercisesPage from '../pages/exercises/ExercisesPage';
import ExercisePage from '../pages/exercises/ExercisePage';
import WorkoutPlansPage from '../pages/workouts/WorkoutPlansPage';
import WorkoutPlanDetailPage from '../pages/workouts/WorkoutPlanDetailPage';
import SessionPage from '../pages/sessions/SessionPage';
import ProfilePage from '../pages/Profile';
import ProgressPage from '../pages/Progress';
import SettingsPage from '../pages/Settings';
import EquipmentDetail from '../pages/equipment/EquipmentDetail';
import AITestingPage from '../pages/ai-testing/AITestingPage';
import RealTimeDetectionPage from '../pages/real-time-detection/RealTimeDetectionPage';
import Achievements from '../pages/Achievements';

// Future flags for React Router v7
const routerOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Admin route check
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ProtectedRoute allowedRoles={['ADMIN']}>{children}</ProtectedRoute>;
};

// Layout wrapper for protected routes
const ProtectedLayout = () => (
  <ProtectedRoute>
    <MainLayout>
      <Outlet />
    </MainLayout>
  </ProtectedRoute>
);

const Router: React.FC = () => {
  return (
    <BrowserRouter {...routerOptions}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes with layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/exercises/:id" element={<ExercisePage />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/workout-plans" element={<WorkoutPlansPage />} />
          <Route path="/workout-plans/:id" element={<WorkoutPlanDetailPage />} />
          <Route path="/sessions" element={<SessionPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/real-time-detection" element={<RealTimeDetectionPage />} />
          
          {/* AI Testing route - only accessible to admins */}
          <Route 
            path="/ai-testing" 
            element={
              <AdminRoute>
                <AITestingPage />
              </AdminRoute>
            } 
          />

          {/* Catch-all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router; 
