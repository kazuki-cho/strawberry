import React from 'react';
import { Clock, FileText, Users, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: <Clock className="h-8 w-8 text-blue-500" />,
    title: '勤怠管理',
    description: '出退勤の記録、休暇申請',
    link: '/attendance'
  },
  {
    icon: <FileText className="h-8 w-8 text-green-500" />,
    title: '経費申請',
    description: '経費の申請と承認状況の確認',
    link: '/expenses'
  },
  {
    icon: <Users className="h-8 w-8 text-purple-500" />,
    title: '社員情報',
    description: '社員データの管理と更新',
    link: '/employees'
  },
  {
    icon: <Calculator className="h-8 w-8 text-red-500" />,
    title: '給与確認',
    description: '給与明細と手当の確認',
    link: '/salary'
  }
];

const Hero: React.FC = () => {
  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.link}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-full">
                {feature.icon}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          お知らせ
        </h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">2025年4月1日</p>
            <p className="text-gray-900 dark:text-white">新年度の社内制度変更について</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">2025年3月25日</p>
            <p className="text-gray-900 dark:text-white">経費精算システムのアップデート完了</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">2025年3月20日</p>
            <p className="text-gray-900 dark:text-white">新入社員研修スケジュールの公開</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;