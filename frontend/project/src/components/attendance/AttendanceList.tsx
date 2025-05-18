import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, FileEdit, PlusCircle } from 'lucide-react';
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

interface MonthlyStats {
  workDays: number;
  totalHours: number;
  leaveHours: number;
}

const AttendanceList: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    workDays: 0,
    totalHours: 0,
    leaveHours: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAttendanceRecords();
    }
  }, [user, currentMonth]);

  const fetchAttendanceRecords = async () => {
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      // 従業員IDの取得
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (employeeError) throw employeeError;

      if (!employeeData) {
        setError('従業員データが見つかりません');
        setLoading(false);
        return;
      }

      // 勤怠記録の取得
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeData.id)
        .gte('date', startOfMonth.toISOString())
        .lte('date', endOfMonth.toISOString())
        .order('date', { ascending: true });

      if (attendanceError) throw attendanceError;

      setRecords(attendanceData || []);

      // 月次統計の計算
      const stats = calculateMonthlyStats(attendanceData || []);
      setMonthlyStats(stats);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      setError('勤怠記録の取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyStats = (data: AttendanceRecord[]): MonthlyStats => {
    return data.reduce((acc, record) => {
      if (record.status === '通常勤務' && record.clock_in && record.clock_out) {
        const clockIn = new Date(record.clock_in);
        const clockOut = new Date(record.clock_out);
        const breakTime = parseFloat(record.break_time) || 0;
        const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60) - breakTime;
        
        return {
          workDays: acc.workDays + 1,
          totalHours: acc.totalHours + hours,
          leaveHours: acc.leaveHours + (record.status === '有給休暇' ? 8 : 0),
        };
      }
      return acc;
    }, { workDays: 0, totalHours: 0, leaveHours: 0 });
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">勤怠管理</h1>
          <div className="flex gap-2">
            <Link
              to="/attendance/edit"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <FileEdit className="h-5 w-5 mr-2" />
              勤怠修正
            </Link>
            <Link
              to="/attendance/leave"
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              休暇申請
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              ←
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">勤務日数</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {monthlyStats.workDays}日
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">総勤務時間</h3>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {monthlyStats.totalHours.toFixed(1)}時間
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-purple-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">有給休暇</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {monthlyStats.leaveHours / 8}日
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    日付
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    出勤時刻
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    退勤時刻
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    休憩時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    状態
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(record.date).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatTime(record.clock_in)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatTime(record.clock_out)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {record.break_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.status === '通常勤務'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceList;