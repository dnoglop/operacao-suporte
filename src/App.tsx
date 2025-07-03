import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { KPICard } from './components/KPICard';
import { ChartCard } from './components/ChartCard';
import { FeedbackCard } from './components/FeedbackCard';
import { ParticipantTable } from './components/ParticipantTable';
import { FileUpload } from './components/FileUpload';
import { AIInsights } from './components/AIInsights';
import { mockMentorshipData } from './data/mockData';
import { calculateKPIs, generateChartData, analyzeFeedback, generateAIInsights } from './utils/analytics';
import { MentorshipData } from './types';

function App() {
  const [data, setData] = useState<MentorshipData[]>(mockMentorshipData);
  const [showUpload, setShowUpload] = useState(false);

  const kpis = calculateKPIs(data);
  const chartData = generateChartData(data);
  const feedbackData = analyzeFeedback(data);
  const aiInsights = generateAIInsights(data);

  const handleDataUpload = (newData: MentorshipData[]) => {
    setData(newData);
  };

  const kpiCards = [
    {
      title: 'Total de Participantes',
      value: kpis.totalParticipants,
      change: 12,
      icon: 'users',
      color: 'bg-blue-500'
    },
    {
      title: 'Encontros Realizados',
      value: kpis.completedMeetings,
      change: 8,
      icon: 'calendar',
      color: 'bg-green-500'
    },
    {
      title: 'Nota Média',
      value: `${kpis.averageRating}/10`,
      change: 5,
      icon: 'star',
      color: 'bg-yellow-500'
    },
    {
      title: 'Duração Média',
      value: `${kpis.averageDuration}min`,
      change: -2,
      icon: 'clock',
      color: 'bg-purple-500'
    },
    {
      title: 'Engajamento Médio',
      value: `${kpis.averageEngagement}/10`,
      change: 15,
      icon: 'award',
      color: 'bg-indigo-500'
    },
    {
      title: 'Validados',
      value: kpis.validatedParticipants,
      change: 25,
      icon: 'message',
      color: 'bg-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header onUploadClick={() => setShowUpload(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {kpiCards.map((kpi, index) => (
            <KPICard key={kpi.title} {...kpi} index={index} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard
            title="Distribuição de Notas"
            data={chartData.ratingDistribution}
            type="bar"
            colors={['#3B82F6']}
            index={0}
          />
          <ChartCard
            title="Distribuição por Programa"
            data={chartData.programDistribution}
            type="pie"
            colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']}
            index={1}
          />
          <ChartCard
            title="Mentores vs Mentorados"
            data={chartData.roleDistribution}
            type="pie"
            colors={['#8B5CF6', '#10B981']}
            index={2}
          />
          <ChartCard
            title="Frequência de Encontros (1-8)"
            data={chartData.meetingFrequency}
            type="bar"
            colors={['#F59E0B']}
            index={3}
          />
        </div>

        {/* AI Insights Section */}
        <div className="mb-8">
          <AIInsights insights={aiInsights} />
        </div>

        {/* AI Feedback Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Feedback Individual IA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbackData.map((feedback, index) => (
              <FeedbackCard 
                key={index} 
                {...feedback} 
                index={index} 
              />
            ))}
          </div>
          {feedbackData.length === 0 && (
            <div className="text-center py-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50">
              <p className="text-gray-600">Nenhum feedback da IA disponível nos dados carregados.</p>
            </div>
          )}
        </motion.div>

        {/* Participants Table */}
        <ParticipantTable data={data} />
      </main>

      <AnimatePresence>
        {showUpload && (
          <FileUpload
            onDataUpload={handleDataUpload}
            onClose={() => setShowUpload(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;