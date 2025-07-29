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
  Grid,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';

type EmployeeData = {
  employee_code: string;
  first_name: string;
  last_name: string;
  department: string;
  position: string;
  hire_date: string | null;
};

type SalarySettingsData = {
  base_salary: number;
  life_plan_allowance: number;
  dc_pension_contribution: number;
  professional_allowance: number;
  fixed_overtime_pay: number;
  deductions: { [key: string]: number };
};

type InsuranceRateDetail = {
  health_insurance_rate: number;
  nursing_insurance_rate: number;
  pension_insurance_rate: number;
  employment_insurance_rate: number;
};

type InsuranceRatesData = {
  rates_by_year: {
    [key: string]: InsuranceRateDetail;
  };
};

const numberInputSx = {
  '& input[type=number]': {
    '-moz-appearance': 'textfield',
  },
  '& input[type=number]::-webkit-outer-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '& input[type=number]::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
};

const SalarySettingsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [settings, setSettings] = useState<SalarySettingsData | null>(null);
  const [ratesData, setRatesData] = useState<InsuranceRatesData | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('令和6年');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculationDetails, setCalculationDetails] = useState({
    grossSalary: 0,
    standardCompensation: 0,
    healthInsurance: 0,
    pensionInsurance: 0,
    employmentInsurance: 0,
    incomeTax: 0,
    residenceTax: 0,
    totalDeductions: 0,
    netSalary: 0,
  });

  const getStandardCompensation = (remuneration: number): number => {
    if (remuneration < 63000) return 58000;
    if (remuneration < 73000) return 68000;
    if (remuneration < 83000) return 78000;
    if (remuneration < 93000) return 88000;
    if (remuneration < 101000) return 98000;
    if (remuneration < 107000) return 104000;
    if (remuneration < 114000) return 110000;
    if (remuneration < 122000) return 118000;
    if (remuneration < 130000) return 126000;
    if (remuneration < 138000) return 134000;
    if (remuneration < 146000) return 142000;
    if (remuneration < 155000) return 150000;
    if (remuneration < 165000) return 160000;
    if (remuneration < 175000) return 170000;
    if (remuneration < 185000) return 180000;
    if (remuneration < 195000) return 190000;
    if (remuneration < 210000) return 200000;
    if (remuneration < 230000) return 220000;
    if (remuneration < 250000) return 240000;
    if (remuneration < 270000) return 260000;
    if (remuneration < 290000) return 280000;
    if (remuneration < 310000) return 300000;
    if (remuneration < 330000) return 320000;
    if (remuneration < 350000) return 340000;
    if (remuneration < 370000) return 360000;
    if (remuneration < 395000) return 380000;
    if (remuneration < 425000) return 410000;
    if (remuneration < 455000) return 440000;
    if (remuneration < 485000) return 470000;
    if (remuneration < 515000) return 500000;
    if (remuneration < 545000) return 530000;
    if (remuneration < 575000) return 560000;
    if (remuneration < 605000) return 590000;
    if (remuneration < 635000) return 620000;
    if (remuneration < 665000) return 650000;
    if (remuneration < 695000) return 680000;
    if (remuneration < 730000) return 710000;
    if (remuneration < 770000) return 750000;
    if (remuneration < 810000) return 790000;
    if (remuneration < 855000) return 830000;
    if (remuneration < 905000) return 880000;
    if (remuneration < 955000) return 930000;
    if (remuneration < 1005000) return 980000;
    if (remuneration < 1055000) return 1030000;
    if (remuneration < 1105000) return 1090000;
    if (remuneration < 1155000) return 1150000;
    if (remuneration < 1205000) return 1210000;
    if (remuneration < 1255000) return 1270000;
    if (remuneration < 1305000) return 1330000;
    if (remuneration < 1355000) return 1390000;
    return 1390000;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const ratesRes = await fetch(`http://localhost:5001/api/insurance-rates`);
        if (!ratesRes.ok) throw new Error('保険料率の取得に失敗しました。');
        const ratesData = await ratesRes.json();
        setRatesData(ratesData);

        const empRes = await fetch(`http://localhost:5001/api/employees/${id}`);
        if (!empRes.ok) throw new Error('従業員情報の取得に失敗しました。');
        const empData = await empRes.json();
        setEmployee(empData);

        const settingsRes = await fetch(`http://localhost:5001/api/employees/${id}/salary`);
        if (!settingsRes.ok) throw new Error('給与設定の取得に失敗しました。');
        const settingsData = await settingsRes.json();
        setSettings(settingsData);

      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id]);

  useEffect(() => {
    if (!settings || !ratesData) return;

    const rates = ratesData.rates_by_year[selectedYear];
    if (!rates) return;

    const calculateDetails = () => {
      const { base_salary, life_plan_allowance, dc_pension_contribution, professional_allowance, fixed_overtime_pay } = settings;
      const grossSalary = base_salary + (life_plan_allowance - dc_pension_contribution) + professional_allowance + fixed_overtime_pay;
      const standardCompensation = getStandardCompensation(grossSalary);

      const healthInsurance = standardCompensation * rates.health_insurance_rate;
      const pensionInsurance = standardCompensation * rates.pension_insurance_rate;
      const socialInsuranceTotal = healthInsurance + pensionInsurance;

      const employmentInsurance = grossSalary * rates.employment_insurance_rate;

      const taxableIncome = grossSalary - socialInsuranceTotal - employmentInsurance;
      const monthlyTaxable = taxableIncome > 0 ? taxableIncome : 0;
      let incomeTax = 0;
      if (monthlyTaxable > 850000) incomeTax = (monthlyTaxable * 0.45 - 154750);
      else if (monthlyTaxable > 695000) incomeTax = (monthlyTaxable * 0.33 - 69750);
      else if (monthlyTaxable > 330000) incomeTax = (monthlyTaxable * 0.23 - 35250);
      else if (monthlyTaxable > 195000) incomeTax = (monthlyTaxable * 0.10 - 9750);
      else if (monthlyTaxable > 0) incomeTax = monthlyTaxable * 0.05;
      
      const residenceTax = (taxableIncome * 0.1) > 0 ? (taxableIncome * 0.1) : 0;

      const totalDeductions = socialInsuranceTotal + employmentInsurance + incomeTax + residenceTax;
      const netSalary = grossSalary - totalDeductions;

      setCalculationDetails({
        grossSalary: Math.round(grossSalary),
        standardCompensation: standardCompensation,
        healthInsurance: Math.round(healthInsurance),
        pensionInsurance: Math.round(pensionInsurance),
        employmentInsurance: Math.round(employmentInsurance),
        incomeTax: Math.round(incomeTax),
        residenceTax: Math.round(residenceTax),
        totalDeductions: Math.round(totalDeductions),
        netSalary: Math.round(netSalary),
      });
    };

    calculateDetails();
  }, [settings, ratesData, selectedYear]);

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

  const handleYearChange = (event: SelectChangeEvent) => {
    setSelectedYear(event.target.value as string);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">給与設定</Typography>
        <Button variant="outlined" onClick={() => navigate('/salary-settings')}>
          給与設定一覧へ戻る
        </Button>
      </Box>

      {employee && (
        <Box mb={3}>
          <Typography variant="h5">{`${employee.last_name} ${employee.first_name}`}</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary">社員番号: {employee.employee_code}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary">入社日: {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary">部署: {employee.department}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary">役職: {employee.position}</Typography>
            </Grid>
          </Grid>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {settings && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>支給項目</Typography>
            <TextField
              name="base_salary"
              label="基本給"
              type="number"
              value={settings.base_salary}
              onChange={handleChange}
              fullWidth
              margin="normal"
              sx={numberInputSx}
            />
            <TextField
              name="life_plan_allowance"
              label="生涯設計手当"
              type="number"
              value={settings.life_plan_allowance}
              onChange={handleChange}
              fullWidth
              margin="normal"
              sx={numberInputSx}
            />
            <TextField
              name="dc_pension_contribution"
              label="確定拠出年金掛金 (DC)"
              type="number"
              value={settings.dc_pension_contribution}
              onChange={handleChange}
              fullWidth
              margin="normal"
              sx={numberInputSx}
              helperText="生涯設計手当から拠出する額を入力"
            />
            <TextField
              name="professional_allowance"
              label="職能給"
              type="number"
              value={settings.professional_allowance}
              onChange={handleChange}
              fullWidth
              margin="normal"
              sx={numberInputSx}
            />
            <TextField
              name="fixed_overtime_pay"
              label="固定残業代"
              type="number"
              value={settings.fixed_overtime_pay}
              onChange={handleChange}
              fullWidth
              margin="normal"
              sx={numberInputSx}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>給与シミュレーション</Typography>
              <FormControl size="small">
                <InputLabel>年度</InputLabel>
                <Select value={selectedYear} label="年度" onChange={handleYearChange}>
                  {ratesData && Object.keys(ratesData.rates_by_year).map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container spacing={1}>
                <Grid item xs={6}><Typography>総支給額</Typography></Grid>
                <Grid item xs={6}><Typography align="right">&yen; {calculationDetails.grossSalary.toLocaleString()}</Typography></Grid>

                <Grid item xs={12}><Divider sx={{ my: 1 }}><Typography variant="caption">社会保険料計算の基礎</Typography></Divider></Grid>

                <Grid item xs={6}><Typography color="text.secondary">標準報酬月額</Typography></Grid>
                <Grid item xs={6}><Typography align="right" color="text.secondary">&yen; {calculationDetails.standardCompensation.toLocaleString()}</Typography></Grid>

                <Grid item xs={12}><Divider sx={{ my: 1 }}><Typography variant="caption">控除</Typography></Divider></Grid>

                <Grid item xs={6}><Typography color="text.secondary">健康保険料</Typography></Grid>
                <Grid item xs={6}><Typography align="right" color="text.secondary">&yen; {calculationDetails.healthInsurance.toLocaleString()}</Typography></Grid>

                <Grid item xs={6}><Typography color="text.secondary">厚生年金保険料</Typography></Grid>
                <Grid item xs={6}><Typography align="right" color="text.secondary">&yen; {calculationDetails.pensionInsurance.toLocaleString()}</Typography></Grid>

                <Grid item xs={6}><Typography color="text.secondary">雇用保険料</Typography></Grid>
                <Grid item xs={6}><Typography align="right" color="text.secondary">&yen; {calculationDetails.employmentInsurance.toLocaleString()}</Typography></Grid>

                <Grid item xs={6}><Typography color="text.secondary">所得税</Typography></Grid>
                <Grid item xs={6}><Typography align="right" color="text.secondary">&yen; {calculationDetails.incomeTax.toLocaleString()}</Typography></Grid>

                <Grid item xs={6}><Typography color="text.secondary">住民税</Typography></Grid>
                <Grid item xs={6}><Typography align="right" color="text.secondary">&yen; {calculationDetails.residenceTax.toLocaleString()}</Typography></Grid>

                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                <Grid item xs={6}><Typography variant="subtitle1">差引支給額</Typography></Grid>
                <Grid item xs={6}><Typography variant="subtitle1" align="right">&yen; {calculationDetails.netSalary.toLocaleString()}</Typography></Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Box sx={{ mt: 3 }}>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : '保存'}
        </Button>
      </Box>
    </Paper>
  );
};

export default SalarySettingsPage;