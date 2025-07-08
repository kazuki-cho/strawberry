import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import EmployeeList from './components/EmployeeList';
import EmployeeDetail from './components/EmployeeDetail';
import SalaryDashboard from './components/SalaryDashboard';
import SalarySettingsPage from './components/SalarySettingsPage';
import SalaryDetailPage from './components/SalaryDetailPage';
import SalaryEditPage from './components/SalaryEditPage';

// MUIのテーマを作成
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// ページコンポーネントのダミー実装 (MUIを使用)
const Login = () => <Box><Typography variant="h4">ログインページ</Typography></Box>;
const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <Typography variant="h4" gutterBottom>ダッシュボード</Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/employees')}>
        社員一覧へ
      </Button>
      <Button variant="contained" color="secondary" onClick={() => navigate('/salary')} sx={{ ml: 2 }}>
        給与管理へ
      </Button>
    </Box>
  );
};
const Employees = () => <EmployeeList />;
const EmployeeNew = () => <Box><Typography variant="h4">従業員登録</Typography></Box>;
const Expenses = () => <Box><Typography variant="h4">経費申請</Typography></Box>;
const Attendance = () => <Box><Typography variant="h4">勤怠管理</Typography></Box>;
const AttendanceEdit = () => <Box><Typography variant="h4">勤怠修正</Typography></Box>;
const AttendanceLeave = () => <Box><Typography variant="h4">休暇申請</Typography></Box>;

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Strawberry
              </Typography>
            </Toolbar>
          </AppBar>
          <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/employees/new" element={<EmployeeNew />} />
              <Route path="/employees/:id" element={<EmployeeDetail />} />
              <Route path="/salary" element={<SalaryDashboard />} />
              <Route path="/employees/:id/salary" element={<SalarySettingsPage />} />
              <Route path="/salary/:id" element={<SalaryDetailPage />} />
              <Route path="/salary/new" element={<SalaryEditPage />} />
              <Route path="/salary/:id/edit" element={<SalaryEditPage />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/attendance/edit" element={<AttendanceEdit />} />
              <Route path="/attendance/leave" element={<AttendanceLeave />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Container>
          <Box
            component="footer"
            sx={{
              py: 2,
              px: 2,
              mt: 'auto',
              backgroundColor: (theme) =>
                theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
            }}
          >
            <Container maxWidth="sm">
              <Typography variant="body2" color="text.secondary" align="center">
                &copy; {new Date().getFullYear()} Strawberry Inc.
              </Typography>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;