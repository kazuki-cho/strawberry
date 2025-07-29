import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Typography, CircularProgress, Alert, Box, Button, TextField, Grid, Select, MenuItem, FormControl, InputLabel, Pagination, Checkbox,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
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
  const [selected, setSelected] = useState<string[]>([]);
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
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

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
      setSelected([]); // ページが変わったら選択をリセット
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
      setGenerateDialogOpen(false);
    } catch (e: any) {
      setGenerateError(e.message);
    } finally {
      setGenerateLoading(false);
    }
  };

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

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = records.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleSelectOneClick = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleDelete = async () => {
    if (selected.length === 0) return;
    if (window.confirm(`${selected.length}件の履歴を削除します。よろしいですか？`)) {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5001/api/salary_records`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selected }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || '削除に失敗しました。');
        }
        setGenerateSuccess(`${selected.length}件の履歴を削除しました。`);
        fetchRecords(page); // Refresh list
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4" component="h2" sx={{ mr: 2 }}>給与履歴</Typography>
          <Button variant="outlined" onClick={() => navigate('/salary')} sx={{ mr: 1 }}>給与管理TOPへ戻る</Button>
          <Button variant="outlined" onClick={() => navigate('/')}>ダッシュボードへ戻る</Button>
        </Box>
        <Box>
          {selected.length > 0 && (
            <Button variant="contained" color="error" onClick={handleDelete} sx={{ mr: 1 }}>
              選択した{selected.length}件を削除
            </Button>
          )}
          <Button variant="contained" color="primary" onClick={() => setGenerateDialogOpen(true)} sx={{ mr: 1 }}>
            一括作成
          </Button>
          <Button variant="contained" onClick={() => navigate('/salary/new')}>
            新規作成
          </Button>
        </Box>
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

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {generateSuccess && <Alert severity="success" sx={{ mt: 2 }}>{generateSuccess}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < records.length}
                  checked={records.length > 0 && selected.length === records.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all desserts' }}
                />
              </TableCell>
              <TableCell>対象年月</TableCell>
              <TableCell>社員番号</TableCell>
              <TableCell>氏名</TableCell>
              <TableCell>種別</TableCell>
              <TableCell>基本給</TableCell>
              <TableCell>手当合計</TableCell>
              <TableCell>控除合計</TableCell>
              <TableCell>支給額</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center"><CircularProgress /></TableCell></TableRow>
            ) : (
              records.map((rec) => {
                const isItemSelected = isSelected(rec.id);
                return (
                  <TableRow 
                    key={rec.id}
                    hover
                    onClick={(event) => handleSelectOneClick(event as any, rec.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        inputProps={{ 'aria-labelledby': `enhanced-table-checkbox-${rec.id}` }}
                      />
                    </TableCell>
                    <TableCell>{new Date(rec.year_month).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}</TableCell>
                    <TableCell>{rec.employee_code}</TableCell>
                    <TableCell>{rec.last_name} {rec.first_name}</TableCell>
                    <TableCell>{rec.details.type === 'salary' ? '給与' : '賞与'}</TableCell>
                    <TableCell>{rec.details.base_salary ? rec.details.base_salary.toLocaleString() : 0}円</TableCell>
                    <TableCell>{rec.details.allowances ? Object.values(rec.details.allowances).reduce((a, b) => a + b, 0).toLocaleString() : 0}円</TableCell>
                    <TableCell>{rec.details.deductions ? Object.values(rec.details.deductions).reduce((a, b) => a + b, 0).toLocaleString() : 0}円</TableCell>
                    <TableCell>{rec.net_salary.toLocaleString()}円</TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" onClick={(e) => { e.stopPropagation(); navigate(`/salary/${rec.id}`)}}>詳細</Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {!loading && !error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" disabled={totalPages === 0} />
        </Box>
      )}

      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)}>
        <DialogTitle>給与明細一括生成</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{mb: 2}}>
            全従業員分の給与明細を指定した年月のデータで一括生成します。
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="対象年月 (YYYY-MM)"
            value={generateMonth}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGenerateMonth(e.target.value)}
            fullWidth
            placeholder="例: 2024-07"
            inputProps={{ maxLength: 7 }}
          />
          <FormControl fullWidth sx={{mt: 2}}>
            <InputLabel>種別</InputLabel>
            <Select
              value={generateType}
              onChange={(e) => setGenerateType(e.target.value as string)}
            >
              <MenuItem value="salary">給与</MenuItem>
              <MenuItem value="bonus">賞与</MenuItem>
            </Select>
          </FormControl>
          {generateError && <Alert severity="error" sx={{ mt: 2 }}>{generateError}</Alert>}
          {preCheckError && <Alert severity="error" sx={{ mt: 2 }}>{preCheckError}</Alert>}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>キャンセル</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              if (!/^\d{4}-\d{2}$/.test(generateMonth)) {
                setGenerateError('対象年月はYYYY-MM形式で入力してください');
                return;
              }
              const exists = await preCheckSalaryRecords();
              if (exists) {
                setForceParams({ month: generateMonth, type: generateType });
                setForceConfirmOpen(true);
                return;
              }
              handleGenerate();
            }}
            disabled={generateLoading || preCheckLoading}
          >
            {generateLoading || preCheckLoading ? <CircularProgress size={24} /> : '一括作成'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default SalaryHistoryPage;