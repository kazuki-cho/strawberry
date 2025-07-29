import React from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleIcon from '@mui/icons-material/People';

const HomePage: React.FC = () => {
  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h2" gutterBottom>
        Strawberry
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 6 }}>
        社内管理システム
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} sm={5}>
          <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <MonetizationOnIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              給与管理
            </Typography>
            <Button component={RouterLink} to="/salary" variant="contained" size="large" sx={{ mt: 'auto' }}>
              ダッシュボードへ
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <PeopleIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              従業員管理
            </Typography>
            <Button component={RouterLink} to="/employees" variant="contained" size="large" sx={{ mt: 'auto' }}>
              一覧へ
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
