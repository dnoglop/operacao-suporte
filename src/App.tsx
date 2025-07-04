// src/App.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';

import { Header } from './components/Header';
import { KPICard } from './components/KPICard';
import { ChartCard } from './components/ChartCard';
import { FeedbackCard } from './components/FeedbackCard';
import { FeedbackModal } from './components/FeedbackModal';
import { ParticipantTable } from './components/ParticipantTable';
import { FileUpload } from './components/FileUpload';
import { AIInsights } from './components/AIInsights';
import { calculateKPIs, calculateKPIGrowth, generateChartData, analyzeFeedback, generateAIInsights } from './utils/analytics';
import { MentorshipData, FeedbackItem } from './types';

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSSSSZJB5Ubh4BopYwYzwaCi7yjCv0QoEjjojP8ztCqtVixQYgFQVWj064lyfyVCoAkKPLXk9ensj2-/pub?gid=1449497486&single=true&output=csv';

function App() {
  const [data, setData] = useState<MentorshipData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showUpload, setShowUpload] = useState(false);
  const [showAllFeedback, setShowAllFeedback] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      Papa.parse(GOOGLE_SHEET_CSV_URL, {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: header => header.trim(),
        complete: (results) => {
          setData(results.data as MentorshipData[]);
          setIsLoading(false);
        },
        error: (err) => {
          setError("Falha ao carregar os dados. Verifique a conexão e o link da planilha.");
          setIsLoading(false);
        }
      });
    };
    fetchData();
  }, []);

  const kpis = calculateKPIs(data);
  const kpiGrowth = calculateKPIGrowth(data);
  const chartData = generateChartData(data);
  const recentFeedbackData: FeedbackItem[] = analyzeFeedback(data, 10);
  const aiInsights = generateAIInsights(data);

  const handleDataUpload = (newData: MentorshipData[]) => setData(newData);
  
  const kpiCards = [
    { title: 'Total de Participantes', value: kpis.totalParticipants, change: kpiGrowth.totalParticipants, icon: 'users', color: 'bg-blue-500' },
    { title: 'Encontros Realizados', value: kpis.completedMeetings, change: kpiGrowth.completedMeetings, icon: 'calendar', color: 'bg-green-500' },
    { title: 'Nota Média', value: `${kpis.averageRating}/10`, change: kpiGrowth.averageRating, icon: 'star', color: 'bg-yellow-500' },
    { title: 'Duração Média', value: `${kpis.averageDuration}min`, change: kpiGrowth.averageDuration, icon: 'clock', color: 'bg-purple-500' },
    { title: 'Engajamento Médio', value: `${kpis.averageEngagement}/10`, change: kpiGrowth.averageEngagement, icon: 'award', color: 'bg-indigo-500' },
    { title: 'Validados', value: kpis.validatedParticipants, change: kpiGrowth.validatedParticipants, icon: 'check', color: 'bg-pink-500' }
  ];

  const renderDashboard = () => {
    if (isLoading) return <div className="text-center py-20 text-gray-600 font-semibold">Carregando dashboard...</div>;
    if (error) return <div className="text-center py-20 text-red-600 font-semibold">{error}</div>;
    
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {kpiCards.map((kpi, index) => <KPICard key={kpi.title} {...kpi} index={index} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Distribuição de Notas" data={chartData.ratingDistribution} type="bar" colors={['#3B82F6']} index={0} />
          <ChartCard title="Distribuição por Programa" data={chartData.programDistribution} type="pie" colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']} index={1} />
        </div>
        <AIInsights insights={aiInsights} />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Feedback Individual IA</h2>
              <p className="text-sm text-gray-600">Últimos 10 comentários publicados</p>
            </div>
            {data.length > 10 && (
              <button onClick={() => setShowAllFeedback(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Ver todos ({analyzeFeedback(data).length})
              </button>
            )}
          </div>
          <div className="space-y-4">
            {recentFeedbackData.map((feedback, index) => <FeedbackCard key={`${feedback.email}-${index}`} {...feedback} index={index} />)}
          </div>
        </motion.div>
        <ParticipantTable data={data} />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header onUploadClick={() => setShowUpload(true)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </main>
      <AnimatePresence>
        {showUpload && <FileUpload onDataUpload={handleDataUpload} onClose={() => setShowUpload(false)} />}
        {showAllFeedback && <FeedbackModal feedbackData={data} onClose={() => setShowAllFeedback(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default App;