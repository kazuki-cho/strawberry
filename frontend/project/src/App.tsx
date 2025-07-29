import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import EmployeeList from './components/EmployeeList';
import EmployeeDetail from './components/EmployeeDetail';
import SalaryDashboard from './components/SalaryDashboard';
import SalaryHistoryPage from './components/SalaryHistoryPage';
import SalaryDetailPage from './components/SalaryDetailPage';
import SalaryEditPage from './components/SalaryEditPage';
import SalarySettingsListPage from './components/SalarySettingsListPage';
import SalarySettingsPage from './components/SalarySettingsPage';
import InsuranceRatesPage from './components/InsuranceRatesPage';
import HomePage from './components/HomePage'; // 新しくインポート

function App() {
  return (
    <Router>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/salary" element={<SalaryDashboard />} />
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/salary-settings" element={<SalarySettingsListPage />} />
          <Route path="/salary-settings/:id" element={<SalarySettingsPage />} />
          <Route path="/salary-history" element={<SalaryHistoryPage />} />
          <Route path="/salary-history/:id" element={<SalaryDetailPage />} />
          <Route path="/salary-history/edit/:id" element={<SalaryEditPage />} />
          <Route path="/insurance-rates" element={<InsuranceRatesPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
