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

type SalarySettingsData = {
  base_salary: number;
  allowances: { [key: string]: number };
  deductions: { [key: string]: number };
};

const SalarySettingsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SalarySettingsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5001/api/employees/${id}/salary`);
        if (!res.ok) throw new Error('給与設定の取得に失敗しました。');
        const data = await res.json();
        setSettings(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSettings();
  }, [id]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5001/api/employees/${id}/salary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('給与設定の保存に失敗しました。');
      alert('保存しました');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: Number(value) });
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">給与設定</Typography>
        <Button variant="outlined" onClick={() => navigate('/salary')}>
          給与管理一覧へ戻る
        </Button>
      </Box>
      {settings && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="base_salary"
              label="基本給"
              type="number"
              value={settings.base_salary}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          {/* TODO: 手当と控除を動的に追加・編集できるようにする */}
        </Grid>
      )}
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : '保存'}
        </Button>
      </Box>
    </Paper>
  );
};

export default SalarySettingsPage;