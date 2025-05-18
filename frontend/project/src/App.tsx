import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Hero from './components/Hero';
import ExpensePage from './components/expenses/ExpensePage';
import EmployeePage from './components/employees/EmployeePage';
import AttendancePage from './components/attendance/AttendancePage';
import Login from './components/Login';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Hero />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ExpensePage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EmployeePage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AttendancePage />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;