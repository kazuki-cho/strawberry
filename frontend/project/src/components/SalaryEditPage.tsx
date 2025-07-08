import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, CircularProgress, Alert, Paper, Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

type Employee = {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
};

type SalaryRecordForm = {
  employee_code: string;
  year_month: string;
  gross_salary: number;
  net_salary: number;
  details: { type: string; [key: string]: any };
};

const SalaryEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // id があれば編集モード、なければ新規作成モード
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SalaryRecordForm>({
    employee_code: '',
    year_month: '',
    gross_salary: 0,
    net_salary: 0,
    details: { type: 'salary' },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]); // 社員選択用

  // 社員リストの取得
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/employees?limit=1000`);
        const data = await res.json();
        setEmployees(data.employees);
      } catch (e: any) {
        console.error("Failed to fetch employees:", e);
        setError("社員リストの取得に失敗しました。");
      }
    };
    fetchEmployees();
  }, []);

  // 編集モードの場合、既存データを取得
  useEffect(() => {
    if (id) {
      setLoading(true);
      const fetchRecord = async () => {
        try {
          const res = await fetch(`http://localhost:5001/api/salary_records/${id}`);
          if (!res.ok) throw new Error('給与明細の取得に失敗しました。');
          const data = await res.json();
          setFormData({
            employee_code: data.employee_code,
            year_month: data.year_month,
            gross_salary: data.gross_salary,
            net_salary: data.net_salary,
            details: data.details || { type: 'salary' },
          });
        } catch (e: any) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      };
      fetchRecord();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name === 'type') {
      setFormData(prev => ({ ...prev, details: { type: value as string } }));
    } else if (name === 'gross_salary' || name === 'net_salary') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name!]: value }));
    }
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      details: { ...prev.details, [name]: value }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `http://localhost:5001/api/salary_records/${id}` : 'http://localhost:5001/api/salary_records';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || '保存に失敗しました。');
      }

      alert('保存しました');
      navigate('/salary'); // 一覧ページに戻る
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ p: 4, maxWidth: 800, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        {id ? '給与明細編集' : '給与明細新規作成'}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth margin="normal">
            <InputLabel>社員</InputLabel>
            <Select
              name="employee_code"
              value={formData.employee_code}
              onChange={handleChange as any}
              disabled={!!id} // 編集時は社員を変更不可
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.employee_code}>
                  {emp.employee_code} {emp.last_name} {emp.first_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="year_month"
            label="対象年月 (YYYY-MM-DD)"
            value={formData.year_month}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>種別</InputLabel>
            <Select
              name="type"
              value={formData.details.type}
              onChange={handleChange as any}
            >
              <MenuItem value="salary">給与</MenuItem>
              <MenuItem value="bonus">賞与</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="gross_salary"
            label="総支給額"
            type="number"
            value={formData.gross_salary}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="net_salary"
            label="手取り額"
            type="number"
            value={formData.net_salary}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        {formData.details.type === 'salary' && (
          <Grid item xs={12}>
            <TextField
              name="base"
              label="基本給 (詳細)"
              type="number"
              value={formData.details.base || ''}
              onChange={handleDetailChange}
              fullWidth
              margin="normal"
            />
            <TextField
              name="overtime"
              label="残業手当 (詳細)"
              type="number"
              value={formData.details.overtime || ''}
              onChange={handleDetailChange}
              fullWidth
              margin="normal"
            />
          </Grid>
        )}
        {formData.details.type === 'bonus' && (
          <Grid item xs={12}>
            <TextField
              name="reason"
              label="賞与理由 (詳細)"
              value={formData.details.reason || ''}
              onChange={handleDetailChange}
              fullWidth
              margin="normal"
            />
          </Grid>
        )}
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={() => navigate('/salary')}>
          キャンセル
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : '保存'}
        </Button>
      </Box>
    </Paper>
  );
};

export default SalaryEditPage;
