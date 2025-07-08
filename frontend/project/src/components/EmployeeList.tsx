import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Pagination,
  Button
} from '@mui/material';

type Employee = {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  hire_date: string | null;
};

type ApiResponse = {
  total: number;
  employees: Employee[];
};

const PAGE_SIZE = 5;

const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * PAGE_SIZE;
      const res = await fetch(`http://localhost:5001/api/employees?limit=${PAGE_SIZE}&offset=${offset}`);
      if (!res.ok) throw new Error('APIからのデータ取得に失敗しました。');
      const data: ApiResponse = await res.json();
      setEmployees(data.employees);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(page);
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h2">
          従業員一覧
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/')}>
          ダッシュボードへ戻る
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
            <TableRow>
              <TableCell>社員番号</TableCell>
              <TableCell>氏名</TableCell>
              <TableCell>メール</TableCell>
              <TableCell>部署</TableCell>
              <TableCell>役職</TableCell>
              <TableCell>入社日</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow
                  key={emp.id}
                  hover
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {emp.employee_code}
                  </TableCell>
                  <TableCell>{emp.last_name} {emp.first_name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>{emp.hire_date ? new Date(emp.hire_date).toLocaleDateString() : '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && !error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            disabled={totalPages === 0}
          />
        </Box>
      )}
    </Box>
  );
};

export default EmployeeList;