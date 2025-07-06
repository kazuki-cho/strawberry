import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// ページコンポーネントのダミー実装
const Login = () => <div><h2>ログインページ</h2></div>;
const Dashboard = () => <div><h2>ダッシュボード</h2></div>;
const Employees = () => <div><h2>従業員一覧</h2></div>;
const EmployeeNew = () => <div><h2>従業員登録</h2></div>;
const EmployeeDetail = () => <div><h2>従業員詳細</h2></div>;
const Expenses = () => <div><h2>経費申請</h2></div>;
const Attendance = () => <div><h2>勤怠管理</h2></div>;
const AttendanceEdit = () => <div><h2>勤怠修正</h2></div>;
const AttendanceLeave = () => <div><h2>休暇申請</h2></div>;

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/new" element={<EmployeeNew />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/attendance/edit" element={<AttendanceEdit />} />
          <Route path="/attendance/leave" element={<AttendanceLeave />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
