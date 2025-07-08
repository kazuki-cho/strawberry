import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, CircularProgress, Alert, Paper, Grid, Divider
} from '@mui/material';

type SalaryRecordDetail = {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  year_month: string;
  gross_salary: number;
  net_salary: number;
  details: { 
    type: string;
    base?: number;
    overtime?: number;
    reason?: string;
    [key: string]: any 
  };
};

const SalaryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<SalaryRecordDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5001/api/salary_records/${id}`);
        if (!res.ok) throw new Error('給与明細の取得に失敗しました。');
        const data = await res.json();
        setRecord(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRecord();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!record) return <Typography>データが見つかりません。</Typography>;

  const { details } = record;

  return (
    <Paper sx={{ p: 4, maxWidth: 800, margin: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">給与明細</Typography>
        <Button variant="outlined" onClick={() => navigate('/salary')}>一覧へ戻る</Button>
        <Button variant="contained" onClick={() => navigate(`/salary/${id}/edit`)} sx={{ ml: 1 }}>編集</Button>
      </Box>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}><Typography>対象年月: {new Date(record.year_month).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}</Typography></Grid>
        <Grid item xs={6}><Typography>社員番号: {record.employee_code}</Typography></Grid>
        <Grid item xs={12}><Typography variant="h6">{record.last_name} {record.first_name} 様</Typography></Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h5" gutterBottom>支給</Typography>
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {details.type === 'salary' && <>
          <Grid item xs={8}>基本給</Grid><Grid item xs={4} textAlign="right">{details.base?.toLocaleString()}円</Grid>
          <Grid item xs={8}>残業手当</Grid><Grid item xs={4} textAlign="right">{details.overtime?.toLocaleString()}円</Grid>
        </>}
        {details.type === 'bonus' && <>
          <Grid item xs={8}>賞与 ({details.reason})</Grid>
          <Grid item xs={4} textAlign="right">{record.gross_salary.toLocaleString()}円</Grid>
        </>}
      </Grid>
      
      <Divider />
      <Grid container spacing={1} sx={{ my: 1 }}>
        <Grid item xs={8}><Typography variant="h6">総支給額</Typography></Grid>
        <Grid item xs={4} textAlign="right"><Typography variant="h6">{record.gross_salary.toLocaleString()}円</Typography></Grid>
      </Grid>
      <Divider sx={{ my: 2 }} />

      {/* TODO: 控除項目の表示を追加 */}
      <Typography variant="h5" gutterBottom>控除</Typography>
      <Grid container spacing={1}>
        <Grid item xs={8}>健康保険</Grid><Grid item xs={4} textAlign="right">-円</Grid>
        <Grid item xs={8}>厚生年金</Grid><Grid item xs={4} textAlign="right">-円</Grid>
        <Grid item xs={8}>雇用保険</Grid><Grid item xs={4} textAlign="right">-円</Grid>
        <Grid item xs={8}>所得税</Grid><Grid item xs={4} textAlign="right">-円</Grid>
        <Grid item xs={8}>住民税</Grid><Grid item xs={4} textAlign="right">-円</Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />
      <Grid container spacing={1} sx={{ backgroundColor: '#f5f5f5', p: 2 }}>
        <Grid item xs={8}><Typography variant="h5">差引支給額</Typography></Grid>
        <Grid item xs={4} textAlign="right"><Typography variant="h5">{record.net_salary.toLocaleString()}円</Typography></Grid>
      </Grid>

    </Paper>
  );
};

export default SalaryDetailPage;
