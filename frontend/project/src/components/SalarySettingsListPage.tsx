import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Typography, CircularProgress, Alert, Box, Button
} from '@mui/material';

type SalarySetting = {
  employee_id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  base_salary: number | null;
};

const SalarySettingsListPage: React.FC = () => {
  const [settings, setSettings] = useState<SalarySetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:5001/api/employees/salary-settings');
        if (!res.ok) throw new Error('給与設定一覧の取得に失敗しました。');
        const data = await res.json();
        setSettings(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">給与設定一覧</Typography>
        <Box>
          <Button variant="outlined" onClick={() => navigate('/salary')} sx={{ mr: 1 }}>給与管理TOPへ</Button>
          <Button variant="outlined" onClick={() => navigate('/')}>ダッシュボードへ戻る</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>社員番号</TableCell>
              <TableCell>氏名</TableCell>
              <TableCell>基本給</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow>
            ) : (
              settings.map((setting) => (
                <TableRow key={setting.employee_id}>
                  <TableCell>{setting.employee_code}</TableCell>
                  <TableCell>{setting.last_name} {setting.first_name}</TableCell>
                  <TableCell>
                    {setting.base_salary !== null ? `${setting.base_salary.toLocaleString()}円` : <Typography color="error">未設定</Typography>}
                  </TableCell>
                  <TableCell>
                    <Button variant="contained" onClick={() => navigate(`/employees/${setting.employee_id}/salary`)}>
                      {setting.base_salary !== null ? '編集' : '設定'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SalarySettingsListPage;
