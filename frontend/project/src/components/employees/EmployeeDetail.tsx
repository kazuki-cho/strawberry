import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { User, Mail, Building2, UserCircle, Calendar, Hash, ArrowLeft } from 'lucide-react';

interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  hire_date: string;
}

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEmployeeData();
    }
  }, [id]);

  const fetchEmployeeData = async () => {
    try {
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (employeeError) throw employeeError;
      setEmployee(employeeData);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setError('社員データの取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error || '社員データの取得に失敗しました'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">社員詳細</h1>
          <button
            onClick={() => navigate('/employees')}
            className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            戻る
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <UserCircle className="w-16 h-16 text-gray-600 dark:text-gray-300" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                {employee.last_name} {employee.first_name}
              </h1>
              <p className="text-blue-100">{employee.position}</p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Hash className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">社員番号</p>
                    <p className="text-gray-900 dark:text-white">{employee.employee_code}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">メールアドレス</p>
                    <p className="text-gray-900 dark:text-white">{employee.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">部署</p>
                    <p className="text-gray-900 dark:text-white">{employee.department}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">役職</p>
                    <p className="text-gray-900 dark:text-white">{employee.position}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">入社日</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(employee.hire_date).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;