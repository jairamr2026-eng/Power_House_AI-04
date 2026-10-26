// src/App.jsx
// App routing: protects /home, /submit, /tasks, /points, /grid so logged-out users go to /login.

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SubmitTaskPage from './pages/SubmitTaskPage';
import MyTasksPage from './pages/MyTasksPage';
import GreenPointsPage from './pages/GreenPointsPage';
import GridStatusPage from './pages/GridStatusPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Stage 1: Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes: /home, /submit, /tasks, /points, /grid */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Root redirects to /home */}
              <Route index element={<Navigate to="/home" replace />} />
              <Route path="home" element={<DashboardPage />} />
              <Route path="submit" element={<SubmitTaskPage />} />
              <Route path="tasks" element={<MyTasksPage />} />
              <Route path="points" element={<GreenPointsPage />} />
              <Route path="grid" element={<GridStatusPage />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
