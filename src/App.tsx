// src/App.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';

import { Header } from './components/Header';
import { KPICard } from './components/KPICard';
import { ChartCard } from './components/ChartCard';
import { FeedbackModal } from './components/FeedbackModal';
import { ParticipantTable } from './components/ParticipantTable';
import { ParticipantFeedbackModal } from './components/ParticipantFeedbackModal';

import { FilterBar } from './components/FilterBar';
import { AIInsights } from './components/AIInsights';
import { calculateKPIs, calculateKPIGrowth, calculateKPIGrowthIndicators, generateChartData, analyzeFeedback, generateAIInsights, parseDate } from './utils/analytics';
import { MentorshipData, FeedbackItem } from './types';

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSSSSZJB5Ubh4BopYwYzwaCi7yjCv0QoEjjojP8ztCqtVixQYgFQVWj064lyfyVCoAkKPLXk9ensj2-/pub?gid=1449497486&single=true&output=csv';

function App() {
  const [data, setData] = useState<MentorshipData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showAllFeedback, setShowAllFeedback] = useState(false);
  const [showParticipantFeedbackModal, setShowParticipantFeedbackModal] = useState(false);
  const [selectedParticipantEmail, setSelectedParticipantEmail] = useState<string | null>(null);

  const fetchData = () => {
    setIsLoading(true);
    Papa.parse(GOOGLE_SHEET_CSV_URL, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim(),
      complete: (results) => {
        const parsedData = (results.data as MentorshipData[]).map(item => ({
          ...item,
          'Carimbo de data/hora': parseDate(item['Carimbo de data/hora'])
        }));
        setData(parsedData);
        setIsLoading(false);
      },
      error: (err) => {
        setError("Falha ao carregar os dados. Verifique a conexão e o link da planilha.");
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefreshData = () => {
    fetchData();
  };

  const roles = useMemo(() => 
    [...new Set(data.map(d => d['Você é?']?.trim()).filter(Boolean))].sort(), 
    [data]
  );

  const programs = useMemo(() => 
    [...new Set(data.map(d => d['Qual o programa que está participando?']?.trim()).filter(Boolean))].sort(),
    [data]
  );

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' ||
        (item['Nome completo'] && item['Nome completo'].toLowerCase().includes(searchLower)) ||
        (item['Endereço de e-mail'] && item['Endereço de e-mail'].toLowerCase().includes(searchLower));

      const participantRole = item['Você é?']?.trim() ?? '';
      const matchesRole = roleFilter === 'all' || participantRole === roleFilter;

      const participantProgram = item['Qual o programa que está participando?']?.trim() ?? '';
      const matchesProgram = programFilter === 'all' || participantProgram === programFilter;

      const itemDate = item['Carimbo de data/hora'];
      const matchesDate = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);

      return matchesSearch && matchesRole && matchesProgram && matchesDate;
    });
  }, [data, searchTerm, roleFilter, programFilter, startDate, endDate]);

  const kpis = calculateKPIs(filteredData, startDate || new Date(0), endDate || new Date());
  const kpiGrowth = calculateKPIGrowthIndicators(data, startDate || new Date(0), endDate || new Date());
  const chartData = generateChartData(filteredData, startDate || new Date(0), endDate || new Date());
  const recentFeedbackData: FeedbackItem[] = analyzeFeedback(filteredData, 3, startDate || new Date(0), endDate || new Date());
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [triggerAIAnalysis, setTriggerAIAnalysis] = useState(false);

  useEffect(() => {
    if (triggerAIAnalysis && filteredData.length > 0) {
      const fetchInsights = async () => {
        const insights = await generateAIInsights(filteredData, startDate || new Date(0), endDate || new Date());
        setAiInsights(insights);
        setTriggerAIAnalysis(false); // Reset trigger after analysis
      };
      fetchInsights();
    }
  }, [triggerAIAnalysis, filteredData, startDate, endDate]);

  const renderDashboard = () => {
    // CORREÇÃO: Passa os novos indicadores de crescimento para os cards de Mentor/Mentorado
    const kpiCards = [
      { title: 'Respostas de Mentores', value: kpis.respostasDeMentores, change: kpiGrowth.respostasDeMentoresChange, icon: 'users', color: 'bg-blue-500' },
      { title: 'Respostas de Mentorados', value: kpis.respostasDeMentorados, change: kpiGrowth.respostasDeMentoradosChange, icon: 'users', color: 'bg-indigo-500' },
      { title: 'Encontros Realizados', value: kpis.completedMeetings, change: kpiGrowth.completedMeetingsChange, icon: 'calendar', color: 'bg-green-500' },
      { title: 'Nota Média', value: `${kpis.averageRating}/10`, change: kpiGrowth.averageRatingChange, icon: 'star', color: 'bg-yellow-500' },
      { title: 'Duração Média', value: `${kpis.averageDuration}min`, change: kpiGrowth.averageDurationChange, icon: 'clock', color: 'bg-purple-500' },
      { title: 'Engajamento Médio', value: `${kpis.averageEngagement}/10`, change: kpiGrowth.averageEngagementChange, icon: 'award', color: 'bg-pink-500' },
    ];

    if (isLoading) return <div className="text-center py-20 text-gray-600 font-semibold">Carregando dashboard...</div>;
    if (error) return <div className="text-center py-20 text-red-600 font-semibold">{error}</div>;
    
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {kpiCards.map((kpi, index) => <KPICard key={kpi.title} {...kpi} index={index} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Distribuição de Notas" data={chartData.ratingDistribution} type="bar" colors={['#3B82F6']} index={0} />
          <ChartCard title="Distribuição de Engajamento" data={chartData.engagementDistribution} type="bar" colors={['#10B981']} index={1} />
          <ChartCard title="Distribuição por Programa" data={chartData.programDistribution} type="pie" colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']} index={2} />
          <ChartCard title="Distribuição de Duração dos Encontros" data={chartData.durationDistribution} type="bar" colors={['#EF4444']} index={3} />
        </div>
        <AIInsights insights={aiInsights} data={filteredData} setTriggerAIAnalysis={setTriggerAIAnalysis} />

        <div className="mt-8">
          <ParticipantTable
            data={filteredData}
            setShowParticipantFeedbackModal={setShowParticipantFeedbackModal}
            setSelectedParticipant={setSelectedParticipantEmail}
          />
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header onRefreshClick={handleRefreshData} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          programFilter={programFilter}
          setProgramFilter={setProgramFilter}
          roles={roles}
          programs={programs}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
        {renderDashboard()}
      </main>
      <AnimatePresence>
        {showAllFeedback && <FeedbackModal feedbackData={filteredData} onClose={() => setShowAllFeedback(false)} />}
        {showParticipantFeedbackModal && selectedParticipantEmail && (
          <ParticipantFeedbackModal
            participantFeedbacks={data.filter(p => p['Endereço de e-mail'] === selectedParticipantEmail)}
            onClose={() => {
              setShowParticipantFeedbackModal(false);
              setSelectedParticipantEmail(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;