import React, { useEffect, useState } from 'react';

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
      if (!res.ok) throw new Error('API error');
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

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">従業員一覧</h2>
      {loading && <div>読み込み中...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <table className="min-w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">社員番号</th>
            <th className="border px-2 py-1">氏名</th>
            <th className="border px-2 py-1">メール</th>
            <th className="border px-2 py-1">部署</th>
            <th className="border px-2 py-1">役職</th>
            <th className="border px-2 py-1">入社日</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{emp.employee_code}</td>
              <td className="border px-2 py-1">{emp.last_name} {emp.first_name}</td>
              <td className="border px-2 py-1">{emp.email}</td>
              <td className="border px-2 py-1">{emp.department}</td>
              <td className="border px-2 py-1">{emp.position}</td>
              <td className="border px-2 py-1">{emp.hire_date || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2 items-center">
        <button
          className="px-2 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          前へ
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button
          className="px-2 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
        >
          次へ
        </button>
      </div>
    </div>
  );
};

export default EmployeeList;
