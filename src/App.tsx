import React from 'react';
import { motion } from 'framer-motion';
import { Header } from './components/Header';
import { KPICard } from './components/KPICard';
import { ChartCard } from './components/ChartCard';
import { FeedbackCard } from './components/FeedbackCard';
import { ParticipantTable } from './components/ParticipantTable';
import { mockMentorshipData } from './data/mockData';
import { calculateKPIs, generateChartData, analyzeFeedback } from './utils/analytics';

function App() {
  const kpis = calculateKPIs(mockMentorshipData);
  const chartData = generateChartData(mockMentorshipData);
  const feedbackData = analyzeFeedback(mockMentorshipData);

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
      <Header />
      
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
            colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
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
            title="Frequência de Encontros"
            data={chartData.meetingFrequency}
            type="bar"
            colors={['#F59E0B']}
            index={3}
          />
        </div>

        {/* AI Feedback Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Feedback IA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbackData.map((feedback, index) => (
              <FeedbackCard key={index} {...feedback} index={index} />
            ))}
          </div>
        </motion.div>

        {/* Participants Table */}
        <ParticipantTable data={mockMentorshipData} />
      </main>
    </div>
  );
}

export default App;