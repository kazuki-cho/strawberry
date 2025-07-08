import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid
} from '@mui/material';

type Employee = {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  hire_date: string | null;
};

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5001/api/employees/${id}`);
        if (!res.ok) throw new Error('社員情報の取得に失敗しました。');
        const data: Employee = await res.json();
        setEmployee(data);
      } catch (e: any) {
        setError(e.message || 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleUpdate = async () => {
    if (!employee) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      });
      if (!res.ok) throw new Error('更新に失敗しました。');
      setIsEditing(false);
      alert('更新しました');
    } catch (e: any) {
      setError(e.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!employee) return;
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!employee) return <Typography>社員が見つかりません。</Typography>;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        社員詳細
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField label="社員番号" value={employee.employee_code} fullWidth disabled margin="normal" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="入社日" value={employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : '-'} fullWidth disabled margin="normal" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="last_name" label="姓" value={employee.last_name} fullWidth disabled={!isEditing} onChange={handleChange} margin="normal" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="first_name" label="名" value={employee.first_name} fullWidth disabled={!isEditing} onChange={handleChange} margin="normal" />
        </Grid>
        <Grid item xs={12}>
          <TextField name="email" label="メールアドレス" value={employee.email} fullWidth disabled={!isEditing} onChange={handleChange} margin="normal" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="department" label="部署" value={employee.department} fullWidth disabled={!isEditing} onChange={handleChange} margin="normal" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="position" label="役職" value={employee.position} fullWidth disabled={!isEditing} onChange={handleChange} margin="normal" />
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        {isEditing ? (
          <Button variant="contained" color="primary" onClick={handleUpdate} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : '保存'}
          </Button>
        ) : (
          <Button variant="contained" onClick={() => setIsEditing(true)}>
            編集
          </Button>
        )}
        <Button variant="outlined" onClick={() => navigate('/employees')}>
          社員一覧へ戻る
        </Button>
        <Button variant="outlined" onClick={() => navigate('/')}>
          ダッシュボードへ戻る
        </Button>
      </Box>
    </Paper>
  );
};

export default EmployeeDetail;
