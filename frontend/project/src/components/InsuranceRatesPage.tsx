import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  Toolbar,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { Edit, Save, Cancel, Add, Delete } from '@mui/icons-material';

// --- 型定義 ---
interface CompensationGrade {
  id?: number;
  grade: number;
  standard_remuneration: number;
  remuneration_range_min: number;
  remuneration_range_max: number | null;
}

interface RateInfo {
    rate: number;
    effective_date: string;
}

interface InsuranceRates {
  [key: string]: RateInfo;
}

interface FormData {
  title: string;
  grade_effective_date: string;
  insurance_rates: InsuranceRates;
  compensation_grades: CompensationGrade[];
}

// --- API通信 --- 
const API_URL = 'http://localhost:5001/api/insurance-data';

const fetchInsuranceData = async (title: string) => {
  const url = title ? `${API_URL}?title=${encodeURIComponent(title)}` : API_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error('データの取得に失敗しました。');
  return res.json();
};

const postInsuranceData = async (data: FormData) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || '登録に失敗しました。');
  return resData;
};

const putInsuranceData = async (title: string, data: FormData) => {
  const res = await fetch(`${API_URL}/${encodeURIComponent(title)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || '更新に失敗しました。');
  return resData;
};

// --- メインコンポーネント ---
const InsuranceRatesPage: React.FC = () => {
  // --- State定義 ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [availableTitles, setAvailableTitles] = useState<{title: string, effective_date: string}[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  
  const [viewData, setViewData] = useState<FormData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [editMode, setEditMode] = useState<'view' | 'edit' | 'create'>('view');

  const [newRateType, setNewRateType] = useState<string>('');
  const [openAddRateDialog, setOpenAddRateDialog] = useState(false);

  // --- データ取得処理 ---
  const loadData = useCallback(async (title: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInsuranceData(title);
      const fetchedData = {
        title: data.selected_title,
        grade_effective_date: data.grade_effective_date || '',
        insurance_rates: data.insurance_rates,
        compensation_grades: data.compensation_grades,
      };
      setViewData(fetchedData);
      setFormData(JSON.parse(JSON.stringify(fetchedData))); // Deep copy for editing
      if (!title) {
        setAvailableTitles(data.available_titles || []);
        setSelectedTitle(data.selected_title || '');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(''); // 初期ロード
  }, [loadData]);

  // --- イベントハンドラ ---
  const handleTitleChange = (event: SelectChangeEvent) => {
    const newTitle = event.target.value as string;
    setSelectedTitle(newTitle);
    setEditMode('view');
    loadData(newTitle);
  };

  const handleCreateNew = () => {
    if (!viewData) return;
    const newFormData = JSON.parse(JSON.stringify(viewData)); // Deep copy
    newFormData.title = ''; // タイトルは空にする
    newFormData.grade_effective_date = new Date().toISOString().substring(0, 10); // 今日を初期値に
    // 保険料率のeffective_dateも今日に設定
    for (const key in newFormData.insurance_rates) {
        if (newFormData.insurance_rates.hasOwnProperty(key)) {
            newFormData.insurance_rates[key].effective_date = new Date().toISOString().substring(0, 10);
        }
    }
    setFormData(newFormData);
    setEditMode('create');
  };

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    setError(null);
    try {
      let res;
      if (editMode === 'create') {
        res = await postInsuranceData(formData);
      } else {
        res = await putInsuranceData(selectedTitle, formData);
      }

      alert(res.message);
      setEditMode('view');
      const newTitle = editMode === 'create' ? formData.title : selectedTitle;
      await loadData(newTitle);
      const newTitles = await fetchInsuranceData('').then(d => d.available_titles);
      setAvailableTitles(newTitles);
      setSelectedTitle(newTitle);

    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode('view');
    setFormData(JSON.parse(JSON.stringify(viewData))); // 変更を破棄
    setError(null);
  };

  const handleFormChange = (path: string, value: any) => {
    if (!formData) return;
    const keys = path.split('.');
    setFormData(prev => {
      const newState = { ...prev! };
      let current: any = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };

  const handleAddRate = () => {
    if (!formData || !newRateType) return;
    if (formData.insurance_rates.hasOwnProperty(newRateType)) {
        alert('その保険種類は既に存在します。');
        return;
    }
    setFormData(prev => ({
        ...prev!,
        insurance_rates: {
            ...prev!.insurance_rates,
            [newRateType]: { rate: 0, effective_date: new Date().toISOString().substring(0, 10) }
        }
    }));
    setNewRateType('');
    setOpenAddRateDialog(false);
  };

  const handleDeleteRate = (typeToDelete: string) => {
    if (!formData) return;
    if (window.confirm(`${typeToDelete} を削除してもよろしいですか？`)) {
        setFormData(prev => {
            const newRates = { ...prev!.insurance_rates };
            delete newRates[typeToDelete];
            return {
                ...prev!,
                insurance_rates: newRates
            };
        });
    }
  };

  // --- レンダリング ---
  if (loading && !viewData) return <CircularProgress />;

  const data = editMode === 'view' ? viewData : formData;
  if (!data) return <Alert severity="warning">データがありません。</Alert>;

  return (
    <Paper sx={{ p: 3 }}>
      <Toolbar sx={{ p: '0 !important', mb: 2 }}>
        <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
          保険料率・等級マスター管理
        </Typography>
        {editMode === 'view' ? (
          <>
            <Tooltip title="新規作成">
              <IconButton onClick={handleCreateNew}>
                <Add />
              </IconButton>
            </Tooltip>
            <Tooltip title="編集">
              <IconButton onClick={() => setEditMode('edit')}>
                <Edit />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <Button startIcon={<Save />} variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
            <Button startIcon={<Cancel />} onClick={handleCancel} sx={{ ml: 1 }}>
              キャンセル
            </Button>
          </>
        )}
      </Toolbar>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
            {editMode === 'view' ? (
                <FormControl fullWidth>
                    <InputLabel>検索: タイトル</InputLabel>
                    <Select value={selectedTitle} label="検索: タイトル" onChange={handleTitleChange}>
                        {availableTitles.map(t => (
                        <MenuItem key={t.title} value={t.title}>{t.title}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : (
                <TextField
                    fullWidth
                    label="タイトル"
                    value={data.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    disabled={editMode === 'edit'}
                />
            )}
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* --- 等級テーブル --- */}
        <Grid item xs={12} md={6}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 1}}>
                <Typography variant="h6">標準報酬月額等級表</Typography>
                <TextField
                    label="等級表の有効日"
                    type="date"
                    size="small"
                    value={data.grade_effective_date}
                    onChange={(e) => handleFormChange('grade_effective_date', e.target.value)}
                    disabled={editMode === 'view'}
                    InputLabelProps={{ shrink: true }}
                />
            </Box>
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>等級</TableCell>
                  <TableCell>標準報酬月額</TableCell>
                  <TableCell>報酬月額(下限)</TableCell>
                  <TableCell>報酬月額(上限)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.compensation_grades.map((row, index) => (
                  <TableRow key={row.grade}>
                    <TableCell>{row.grade}</TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" variant="standard" type="number" disabled={editMode === 'view'}
                        value={row.standard_remuneration}
                        onChange={(e) => handleFormChange(`compensation_grades.${index}.standard_remuneration`, parseInt(e.target.value) || 0)} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" variant="standard" type="number" disabled={editMode === 'view'}
                        value={row.remuneration_range_min}
                        onChange={(e) => handleFormChange(`compensation_grades.${index}.remuneration_range_min`, parseInt(e.target.value) || 0)} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" variant="standard" type="number" disabled={editMode === 'view'}
                        value={row.remuneration_range_max ?? ''}
                        onChange={(e) => handleFormChange(`compensation_grades.${index}.remuneration_range_max`, e.target.value === '' ? null : parseInt(e.target.value) || 0)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* --- 保険料率テーブル --- */}
        <Grid item xs={12} md={6}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
            <Typography variant="h6">保険料率</Typography>
            {editMode !== 'view' && (
                <Button variant="outlined" startIcon={<Add />} onClick={() => setOpenAddRateDialog(true)}>
                    保険種類を追加
                </Button>
            )}
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>保険種類</TableCell>
                  <TableCell align="right">料率 (%)</TableCell>
                  <TableCell>有効年月日</TableCell>
                  {editMode !== 'view' && <TableCell>操作</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(data.insurance_rates).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableCell>
                    <TableCell align="right">
                       <TextField
                        fullWidth
                        size="small"
                        variant="standard"
                        type="text"
                        inputMode="decimal"
                        disabled={editMode === 'view'}
                        sx={{ textAlign: 'right' }}
                        key={key} // 再レンダリングを強制するためにkeyを設定
                        defaultValue={value.rate * 100}
                        onBlur={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            handleFormChange(`insurance_rates.${key}.rate`, val / 100);
                        }}
                        />
                    </TableCell>
                    <TableCell>
                        <TextField fullWidth size="small" variant="standard" type="date" disabled={editMode === 'view'}
                            value={value.effective_date}
                            onChange={(e) => handleFormChange(`insurance_rates.${key}.effective_date`, e.target.value)} />
                    </TableCell>
                    {editMode !== 'view' && (
                        <TableCell>
                            <IconButton onClick={() => handleDeleteRate(key)} color="error">
                                <Delete />
                            </IconButton>
                        </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* 保険種類追加ダイアログ */}
      <Dialog open={openAddRateDialog} onClose={() => setOpenAddRateDialog(false)}>
        <DialogTitle>新しい保険種類を追加</DialogTitle>
        <DialogContent>
          <DialogContentText>
            追加する保険種類名を入力してください。
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="保険種類名"
            type="text"
            fullWidth
            value={newRateType}
            onChange={(e) => setNewRateType(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddRateDialog(false)}>キャンセル</Button>
          <Button onClick={handleAddRate} disabled={!newRateType}>追加</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default InsuranceRatesPage;