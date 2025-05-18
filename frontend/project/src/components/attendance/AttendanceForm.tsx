import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface AttendanceRecord {
  id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  break_time: string;
  status: string;
}

const AttendanceForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    clock_in: '',
    clock_out: '',
    break_time: '01:00',
    status: '通常勤務'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!employeeData) {
        throw new Error('従業員データが見つかりません');
      }

      const { error: updateError } = await supabase
        .from('attendance_records')
        .upsert([
          {
            employee_id: employeeData.id,
            date: formData.date,
            clock_in: formData.clock_in ? `${formData.date}T${formData.clock_in}:00` : null,
            clock_out: formData.clock_out ? `${formData.date}T${formData.clock_out}:00` : null,
            break_time: formData.break_time,
            status: formData.status
          }
        ]);

      if (updateError) throw updateError;

      setSuccess('勤怠情報を更新しました');
      setTimeout(() => navigate('/attendance'), 2000);
    } catch (error) {
      console.error('Error updating attendance:', error);
      setError('勤怠情報の更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">勤怠修正</h1>
          <button
            onClick={() => navigate('/attendance')}
            className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            戻る
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                日付
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                出勤時刻
              </label>
              <input
                type="time"
                name="clock_in"
                value={formData.clock_in}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                退勤時刻
              </label>
              <input
                type="time"
                name="clock_out"
                value={formData.clock_out}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                休憩時間
              </label>
              <input
                type="time"
                name="break_time"
                required
                value={formData.break_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                状態
              </label>
              <select
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="通常勤務">通常勤務</option>
                <option value="有給休暇">有給休暇</option>
                <option value="欠勤">欠勤</option>
                <option value="遅刻">遅刻</option>
                <option value="早退">早退</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg">
              {success}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  更新中...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  更新する
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceForm;