import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const LeaveRequest: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [remainingLeave, setRemainingLeave] = useState(20); // 仮の値
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    reason: '',
    type: '有給休暇'
  });

  useEffect(() => {
    if (user) {
      fetchRemainingLeave();
    }
  }, [user]);

  const fetchRemainingLeave = async () => {
    // TODO: 有給休暇残数の取得ロジックを実装
    setRemainingLeave(20);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // 休暇期間中の各日に対して勤怠記録を作成
      for (let i = 0; i < days; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        
        const { error: insertError } = await supabase
          .from('attendance_records')
          .upsert([
            {
              employee_id: employeeData.id,
              date: date.toISOString().split('T')[0],
              status: formData.type,
              break_time: '00:00'
            }
          ]);

        if (insertError) throw insertError;
      }

      setSuccess('休暇申請が完了しました');
      setTimeout(() => navigate('/attendance'), 2000);
    } catch (error) {
      console.error('Error submitting leave request:', error);
      setError('休暇申請に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">休暇申請</h1>
          <button
            onClick={() => navigate('/attendance')}
            className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            戻る
          </button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            有給休暇残数
          </h2>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {remainingLeave}日
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                休暇種別
              </label>
              <select
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="有給休暇">有給休暇</option>
                <option value="特別休暇">特別休暇</option>
                <option value="欠勤">欠勤</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                開始日
              </label>
              <input
                type="date"
                name="start_date"
                required
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                終了日
              </label>
              <input
                type="date"
                name="end_date"
                required
                value={formData.end_date}
                onChange={handleChange}
                min={formData.start_date}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                理由
              </label>
              <textarea
                name="reason"
                required
                value={formData.reason}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="休暇の理由を入力してください"
              ></textarea>
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
                  申請中...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  申請する
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequest;