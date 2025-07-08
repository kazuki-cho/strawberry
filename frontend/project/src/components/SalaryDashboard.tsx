import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Typography, CircularProgress, Alert, Box, Button, TextField, Grid, Select, MenuItem, FormControl, InputLabel, Pagination
} from '@mui/material';

type SalaryRecord = {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  year_month: string;
  details: { type: string; [key: string]: any };
  net_salary: number;
};

const SalaryHistoryPage: React.FC = () => {
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useState({
    employee_code: '',
    name: '',
    year: '',
    month: '',
    type: ''
  });

  const [generateMonth, setGenerateMonth] = useState('');
  const [generateType, setGenerateType] = useState('salary');
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null);
  const [forceConfirmOpen, setForceConfirmOpen] = useState(false);
  const [forceParams, setForceParams] = useState<{month: string, type: string} | null>(null);
  const [preCheckLoading, setPreCheckLoading] = useState(false);
  const [preCheckError, setPreCheckError] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  const fetchRecords = useCallback(async (currentPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const offset = (currentPage - 1) * PAGE_SIZE;
      const query = new URLSearchParams({
        ...searchParams,
        limit: String(PAGE_SIZE),
        offset: String(offset)
      }).toString();
      const res = await fetch(`http://localhost:5001/api/salary_records?${query}`);
      if (!res.ok) throw new Error('APIからのデータ取得に失敗しました。');
      const data = await res.json();
      setRecords(data.records);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchRecords(page);
  }, [page, fetchRecords]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name!]: value as string }));
  };

  const handleSearch = () => {
    setPage(1);
    fetchRecords(1);
  };

  const handleGenerate = async (force = false) => {
    setGenerateLoading(true);
    setGenerateError(null);
    setGenerateSuccess(null);
    try {
      const res = await fetch(`http://localhost:5001/api/salary_records/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year_month: generateMonth + '-01',
          type: generateType,
          ...(force ? { force: true } : {})
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        // force指定が必要な場合は確認ダイアログを出す
        if (errorData.error && errorData.error.includes('削除して再作成')) {
          setForceParams({ month: generateMonth, type: generateType });
          setForceConfirmOpen(true);
          setGenerateLoading(false);
          return;
        }
        throw new Error(errorData.error || '給与明細の生成に失敗しました。');
      }
      const data = await res.json();
      setGenerateSuccess(data.message + (data.deleted ? `（${data.deleted}件削除）` : ''));
      fetchRecords(page);
    } catch (e: any) {
      setGenerateError(e.message);
    } finally {
      setGenerateLoading(false);
    }
  };

  // 事前チェック: 指定月・種別のレコードが存在するかAPIで確認
  const preCheckSalaryRecords = async () => {
    setPreCheckLoading(true);
    setPreCheckError(null);
    try {
      const res = await fetch(`http://localhost:5001/api/salary_records?year=${generateMonth.slice(0,4)}&month=${generateMonth.slice(5,7)}&type=${generateType}&limit=1`);
      if (!res.ok) throw new Error('APIエラー');
      const data = await res.json();
      return data.total > 0;
    } catch (e: any) {
      setPreCheckError('事前チェックに失敗しました');
      return false;
    } finally {
      setPreCheckLoading(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h2">給与履歴</Typography>
        <Button variant="contained" onClick={() => navigate('/salary/new')}>
          新規作成
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2}><TextField label="社員番号" name="employee_code" value={searchParams.employee_code} onChange={handleSearchChange} fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="社員名" name="name" value={searchParams.name} onChange={handleSearchChange} fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="年" name="year" type="number" value={searchParams.year} onChange={handleSearchChange} fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="月" name="month" type="number" value={searchParams.month} onChange={handleSearchChange} fullWidth /></Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>種別</InputLabel>
              <Select name="type" value={searchParams.type} onChange={handleSearchChange as any}>
                <MenuItem value=""><em>全て</em></MenuItem>
                <MenuItem value="salary">給与</MenuItem>
                <MenuItem value="bonus">賞与</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}><Button variant="contained" onClick={handleSearch} fullWidth>検索</Button></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5" component="h3" gutterBottom>給与明細一括生成</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              label="対象年月 (YYYY-MM)"
              value={generateMonth}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGenerateMonth(e.target.value)}
              fullWidth
              placeholder="例: 2024-07"
              inputProps={{ maxLength: 7 }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>種別</InputLabel>
              <Select
                value={generateType}
                onChange={(e) => setGenerateType(e.target.value as string)}
              >
                <MenuItem value="salary">給与</MenuItem>
                <MenuItem value="bonus">賞与</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                if (!/^\d{4}-\d{2}$/.test(generateMonth)) {
                  setGenerateError('対象年月はYYYY-MM形式で入力してください');
                  return;
                }
                // 事前チェック: 既存レコードがある場合は確認ダイアログ
                const exists = await preCheckSalaryRecords();
                if (exists) {
                  setForceParams({ month: generateMonth, type: generateType });
                  setForceConfirmOpen(true);
                  return;
                }
                handleGenerate();
              }}
              disabled={generateLoading || preCheckLoading}
              fullWidth
            >
              {generateLoading || preCheckLoading ? <CircularProgress size={24} /> : '一括作成'}
            </Button>
          </Grid>
        </Grid>
        {generateError && <Alert severity="error" sx={{ mt: 2 }}>{generateError}</Alert>}
        {generateSuccess && <Alert severity="success" sx={{ mt: 2 }}>{generateSuccess}</Alert>}
        {preCheckError && <Alert severity="error" sx={{ mt: 2 }}>{preCheckError}</Alert>}
        {/* force確認ダイアログ */}
        {forceConfirmOpen && (
          <Box sx={{ mt: 2, p: 2, border: '1px solid #f44336', borderRadius: 2, background: '#fff0f0' }}>
            <Typography color="error" sx={{ mb: 1 }}>
              既に対象月の給与レコードが存在します。削除して再作成してもよろしいですか？
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" color="error" onClick={() => {
                setForceConfirmOpen(false);
                if (forceParams) handleGenerate(true);
              }}>削除して再作成</Button>
              <Button variant="outlined" onClick={() => setForceConfirmOpen(false)}>キャンセル</Button>
            </Box>
          </Box>
        )}
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
            <TableRow>
              <TableCell>対象年月</TableCell>
              <TableCell>社員番号</TableCell>
              <TableCell>氏名</TableCell>
              <TableCell>種別</TableCell>
              <TableCell>支給額</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow>
            ) : (
              records.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell>{new Date(rec.year_month).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}</TableCell>
                  <TableCell>{rec.employee_code}</TableCell>
                  <TableCell>{rec.last_name} {rec.first_name}</TableCell>
                  <TableCell>{rec.details.type === 'salary' ? '給与' : '賞与'}</TableCell>
                  <TableCell>{rec.net_salary.toLocaleString()}円</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => navigate(`/salary/${rec.id}`)}>詳細</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {!loading && !error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" disabled={totalPages === 0} />
        </Box>
      )}
    </Box>
  );
};

export default SalaryHistoryPage;