import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import EmployeeList from './components/EmployeeList';

// ページコンポーネントのダミー実装
const Login = () => <div><h2>ログインページ</h2></div>;
const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h2>ダッシュボード</h2>
      <button
        style={{ marginTop: 16, padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        onClick={() => navigate('/employees')}
      >
        社員一覧へ
      </button>
    </div>
  );
};
const Employees = () => <EmployeeList />;
const EmployeeNew = () => <div><h2>従業員登録</h2></div>;
const EmployeeDetail = () => <div><h2>従業員詳細</h2></div>;
const Expenses = () => <div><h2>経費申請</h2></div>;
const Attendance = () => <div><h2>勤怠管理</h2></div>;
const AttendanceEdit = () => <div><h2>勤怠修正</h2></div>;
const AttendanceLeave = () => <div><h2>休暇申請</h2></div>;

const App: React.FC = () => {
  const [hello, setHello] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchHello = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5001/api/hello');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setHello(data.message);
    } catch (e: any) {
      setError(e.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const [dbStatus, setDbStatus] = React.useState<string | null>(null);
  const [dbLoading, setDbLoading] = React.useState(false);
  const [dbError, setDbError] = React.useState<string | null>(null);

  const fetchDbCheck = async () => {
    setDbLoading(true);
    setDbError(null);
    setDbStatus(null);
    try {
      const res = await fetch('http://localhost:5001/api/dbcheck');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data.db_status === 'ok') {
        setDbStatus('DB接続成功: ' + data.result);
      } else {
        setDbStatus('DB接続失敗');
        setDbError(data.error || '不明なエラー');
      }
    } catch (e: any) {
      setDbStatus('DB接続失敗');
      setDbError(e.message || 'エラーが発生しました');
    } finally {
      setDbLoading(false);
    }
  };

  return (
    <Router>
      <Header />
      <main style={{ padding: '20px' }}>
        <button onClick={fetchHello} disabled={loading} style={{marginBottom: 16}}>
          {loading ? '取得中...' : 'Hello World取得'}
        </button>
        {hello && <div style={{marginBottom: 16}}>API応答: {hello}</div>}
        {error && <div style={{color: 'red', marginBottom: 16}}>エラー: {error}</div>}
        <button onClick={fetchDbCheck} disabled={dbLoading} style={{marginBottom: 16}}>
          {dbLoading ? 'DB確認中...' : 'DB接続確認'}
        </button>
        {dbStatus && <div style={{marginBottom: 16}}>DB応答: {dbStatus}</div>}
        {dbError && <div style={{color: 'red', marginBottom: 16}}>DBエラー: {dbError}</div>}
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
