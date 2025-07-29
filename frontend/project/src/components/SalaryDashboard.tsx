import React from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HistoryIcon from '@mui/icons-material/History';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';

const SalaryDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        給与管理ダッシュボード
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <ReceiptIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h6">給与明細</Typography>
            <Button component={RouterLink} to="/salary-history" variant="contained" sx={{ mt: 2 }}>一覧へ</Button>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <HistoryIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h6">給与設定</Typography>
            <Button component={RouterLink} to="/salary-settings" variant="contained" sx={{ mt: 2 }}>一覧へ</Button>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <SettingsApplicationsIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h6">保険料率</Typography>
            <Button component={RouterLink} to="/insurance-rates" variant="contained" sx={{ mt: 2 }}>確認・更新</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalaryDashboard;