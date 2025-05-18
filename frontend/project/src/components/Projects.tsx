import React, { useState } from 'react';
import { ExternalLink, Github } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: 'ECプラットフォーム',
    description: '商品リスト、ショッピングカート、決済機能を備えた総合的なオンラインストア',
    tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    image: 'https://images.pexels.com/photos/5076516/pexels-photo-5076516.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    demoUrl: '#',
    repoUrl: '#',
  },
  {
    id: 2,
    title: 'タスク管理アプリ',
    description: 'タスク、プロジェクト、締め切りをチーム協力で管理できる生産性アプリケーション',
    tags: ['React', 'TypeScript', 'Firebase', 'Tailwind CSS'],
    image: 'https://images.pexels.com/photos/5717450/pexels-photo-5717450.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    demoUrl: '#',
    repoUrl: '#',
  },
  {
    id: 3,
    title: '天気予報ダッシュボード',
    description: '予報データ、位置検索、インタラクティブマップを備えたリアルタイム天気アプリケーション',
    tags: ['React', 'Redux', 'Weather API', 'Chart.js'],
    image: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    demoUrl: '#',
    repoUrl: '#',
  },
  {
    id: 4,
    title: 'フィットネストラッカー',
    description: 'ワークアウト、栄養、進捗を追跡する健康・フィットネスアプリケーション',
    tags: ['React Native', 'Express', 'MongoDB', 'GraphQL'],
    image: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    demoUrl: '#',
    repoUrl: '#',
  },
];

const Projects: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('すべて');
  
  const allTags = ['すべて', ...new Set(projects.flatMap(project => project.tags))];
  
  const filteredProjects = activeFilter === 'すべて' 
    ? projects 
    : projects.filter(project => project.tags.includes(activeFilter));

  return (
    <section id="projects" className="py-20 sm:py-32 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            プロジェクト
          </h2>
          <div className="h-1 w-20 bg-blue-500 mx-auto mb-8"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            最近の作品をご覧ください。これらのプロジェクトは、モダンなウェブアプリケーションを構築するための私のスキルと経験を示しています。
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeFilter === tag
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div 
              key={project.id} 
              className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-2"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4">
                  <a 
                    href={project.demoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                  >
                    <ExternalLink size={16} className="mr-1" /> デモを見る
                  </a>
                  <a 
                    href={project.repoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors duration-200"
                  >
                    <Github size={16} className="mr-1" /> ソースコード
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;