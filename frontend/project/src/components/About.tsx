import React from 'react';
import { Code, Layers, Rocket, Users } from 'lucide-react';

const skills = [
  { name: 'HTML/CSS', level: 90 },
  { name: 'JavaScript', level: 85 },
  { name: 'React', level: 80 },
  { name: 'TypeScript', level: 75 },
  { name: 'Node.js', level: 70 },
  { name: 'UI/UXデザイン', level: 65 },
];

const services = [
  {
    title: 'ウェブ開発',
    description: '最新の技術を使用したレスポンシブでモダンなウェブサイトの制作',
    icon: <Code className="h-6 w-6 text-blue-500" />,
  },
  {
    title: 'フロントエンド開発',
    description: 'ReactとTypeScriptを使用したインタラクティブなユーザーインターフェースの構築',
    icon: <Layers className="h-6 w-6 text-purple-500" />,
  },
  {
    title: 'UI/UXデザイン',
    description: '直感的で美しいユーザー体験のデザイン',
    icon: <Users className="h-6 w-6 text-green-500" />,
  },
  {
    title: 'パフォーマンス最適化',
    description: 'ウェブサイトの速度と全体的なパフォーマンスの改善',
    icon: <Rocket className="h-6 w-6 text-orange-500" />,
  },
];

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 sm:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            私について
          </h2>
          <div className="h-1 w-20 bg-blue-500 mx-auto mb-8"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            私は複雑な問題にエレガントなソリューションを提供することに情熱を持つウェブ開発者です。
            モダンなフロントエンド技術に精通し、美しく機能的なアプリケーションを構築しています。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 transform transition-all duration-300 hover:shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">スキル</h3>
            <div className="space-y-6">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                    <span className="text-gray-700 dark:text-gray-300">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full" 
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 transform transition-all duration-300 hover:shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">経歴</h3>
            <div className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300">
                ウェブサイトの仕組みを理解したいという好奇心から、5年前にウェブ開発の旅を始めました。
                それ以来、小規模なビジネスサイトから複雑なウェブアプリケーションまで、様々なプロジェクトに携わってきました。
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                私は継続的な学習と最新の技術やベストプラクティスの習得を信条としています。
                技術的な専門知識と創造的な問題解決を組み合わせることで、期待を超えるソリューションを提供します。
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                コーディング以外の時間は、新しいハイキングコースの探索、SF小説の読書、新しいレシピの実験を楽しんでいます。
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
          提供サービス
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                {service.icon}
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{service.title}</h4>
              <p className="text-gray-700 dark:text-gray-300">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;