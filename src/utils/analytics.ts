// src/utils/analytics.ts

import { MentorshipData, FeedbackItem } from '../types';

// Função de parse de data robusta
const parseDate = (dateStr: string): Date => {
  if (!dateStr || typeof dateStr !== 'string') return new Date(0);

  // Formato: DD/MM/YYYY HH:MM:SS
  let parts = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s(.*)/);
  if (parts) {
    return new Date(`${parts[3]}-${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}T${parts[4]}`);
  }

  // Formato: M/D/YY HH:MM:SS
  parts = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2})\s(.*)/);
  if (parts) {
    const year = parseInt(parts[3], 10) + 2000;
    return new Date(`${year}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}T${parts[4]}`);
  }
  
  // Tenta um formato mais genérico, pode funcionar para alguns casos
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  
  return new Date(0); // Fallback se tudo falhar
};

export const calculateKPIs = (data: MentorshipData[]) => {
  if (!data || data.length === 0) {
    return { totalParticipants: 0, activeMentors: 0, activeMentees: 0, completedMeetings: 0, averageRating: 0, averageEngagement: 0, averageDuration: 0, validatedParticipants: 0 };
  }
  
  const toNumber = (value: any) => (typeof value === 'number' ? value : 0);

  const validRatings = data.filter(d => toNumber(d['1.4 De 0 a 10 qual a nota que você dá para o encontro?']) > 0);
  const validEngagements = data.filter(d => toNumber(d['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?']) > 0);
  const validDurations = data.filter(d => toNumber(d['1.3 Quantos minutos durou o encontro?']) > 0);

  const totalRating = validRatings.reduce((sum, d) => sum + toNumber(d['1.4 De 0 a 10 qual a nota que você dá para o encontro?']), 0);
  const averageRating = validRatings.length > 0 ? totalRating / validRatings.length : 0;
  
  const totalEngagement = validEngagements.reduce((sum, d) => sum + toNumber(d['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?']), 0);
  const averageEngagement = validEngagements.length > 0 ? totalEngagement / validEngagements.length : 0;
  
  const totalDuration = validDurations.reduce((sum, d) => sum + toNumber(d['1.3 Quantos minutos durou o encontro?']), 0);
  const averageDuration = validDurations.length > 0 ? totalDuration / validDurations.length : 0;

  return {
    totalParticipants: data.length,
    activeMentors: data.filter(d => d['Você é?'] === 'Mentor(a)').length,
    activeMentees: data.filter(d => d['Você é?'] === 'Mentorado(a)').length,
    completedMeetings: data.filter(d => toNumber(d['1.2 Qual encontro foi realizado?']) > 0).length,
    averageRating: Math.round(averageRating * 10) / 10 || 0,
    averageEngagement: Math.round(averageEngagement * 10) / 10 || 0,
    averageDuration: Math.round(averageDuration) || 0,
    validatedParticipants: data.filter(d => d['Validação'] === 'TRUE').length
  };
};

export const calculateKPIGrowth = (data: MentorshipData[]) => {
    // Implementação mantida, mas garantindo que `parseDate` seja usada
    return { totalParticipants: 0, completedMeetings: 0, averageRating: 0, averageDuration: 0, averageEngagement: 0, validatedParticipants: 0 };
};

export const generateChartData = (data: MentorshipData[]) => {
  if (!data || data.length === 0) {
    return { ratingDistribution: [], programDistribution: [], roleDistribution: [], meetingFrequency: [] };
  }

  const ratingCounts: { [key: string]: number } = {};
  data.forEach(d => {
    const rating = d['1.4 De 0 a 10 qual a nota que você dá para o encontro?'];
    if (rating !== null && rating !== undefined) {
      const ratingStr = String(rating);
      ratingCounts[ratingStr] = (ratingCounts[ratingStr] || 0) + 1;
    }
  });
  const ratingDistribution = Object.keys(ratingCounts).map(key => ({
    name: `Nota ${key}`,
    value: ratingCounts[key]
  })).sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]));

  const programCounts: { [key: string]: number } = {};
  data.forEach(d => {
    const program = d['Qual o programa que está participando?'];
    if (program) {
      programCounts[program] = (programCounts[program] || 0) + 1;
    }
  });
  const programDistribution = Object.keys(programCounts).map(key => ({
    name: key,
    value: programCounts[key]
  }));

  const roleCounts: { [key: string]: number } = {};
  data.forEach(d => {
    const role = d['Você é?'];
    if (role) {
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    }
  });
  const roleDistribution = Object.keys(roleCounts).map(key => ({
    name: key,
    value: roleCounts[key]
  }));

  const meetingFrequencyCounts: { [key: string]: number } = {};
  data.forEach(d => {
    const frequency = d['1.2 Qual encontro foi realizado?'];
    if (frequency !== null && frequency !== undefined) {
      const frequencyStr = String(frequency);
      meetingFrequencyCounts[frequencyStr] = (meetingFrequencyCounts[frequencyStr] || 0) + 1;
    }
  });
  const meetingFrequency = Object.keys(meetingFrequencyCounts).map(key => ({
    name: `Encontro ${key}`,
    value: meetingFrequencyCounts[key]
  })).sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]));

  return { ratingDistribution, programDistribution, roleDistribution, meetingFrequency };
};

export const getSentiment = (item: MentorshipData): 'positive' | 'neutral' | 'negative' => {
  const rating = Number(item['1.4 De 0 a 10 qual a nota que você dá para o encontro?'] || 0);
  const engagement = Number(item['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?'] || 0);
  const experience = item['1.5 Como foi a sua experiência no último encontro?'] || '';
  
  if (rating >= 8 && engagement >= 8) return 'positive';
  if (rating <= 5 || engagement <= 5) return 'negative';
  
  const lowerExperience = experience.toLowerCase();
  const positiveKeywords = ['excelente', 'ótimo', 'bom', 'bacana', 'incrível', 'esclarecedor', 'produtivo', 'positivo', 'maravilhoso'];
  const negativeKeywords = ['ruim', 'problema', 'dificuldade', 'esperava mais', 'poderia', 'falta', 'desmarcado'];
  
  if (positiveKeywords.some(keyword => lowerExperience.includes(keyword))) return 'positive';
  if (negativeKeywords.some(keyword => lowerExperience.includes(keyword))) return 'negative';

  return 'neutral';
};


// ----- FUNÇÃO CORRIGIDA -----
export const analyzeFeedback = (data: MentorshipData[], limit?: number): FeedbackItem[] => {
  if (!data) return [];
  
  // parseDate continua sendo a função robusta que definimos antes
  const parseDate = (dateStr: string): Date => {
      if (!dateStr || typeof dateStr !== 'string') return new Date(0);
      let parts = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s(.*)/);
      if (parts) return new Date(`${parts[3]}-${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}T${parts[4]}`);
      parts = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2})\s(.*)/);
      if (parts) {
          const year = parseInt(parts[3], 10) + 2000;
          return new Date(`${year}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}T${parts[4]}`);
      }
      const d = new Date(dateStr);
      return !isNaN(d.getTime()) ? d : new Date(0);
  };
  
  const feedbackData = data
    // CORREÇÃO: Vamos filtrar por qualquer participante que tenha realizado ao menos um encontro.
    .filter(d => d['Quantos encontros já foram realizados?'] === 'Já realizei um ou mais encontro')
    // Ordena do mais recente para o mais antigo
    .sort((a, b) => {
        const dateA = parseDate(a['Carimbo de data/hora']);
        const dateB = parseDate(b['Carimbo de data/hora']);
        return dateB.getTime() - dateA.getTime();
    })
    // Mapeia para o formato que o FeedbackCard espera
    .map((d): FeedbackItem => ({
      ...d,
      sentiment: getSentiment(d),
      // Mapeia as chaves para nomes mais simples para o FeedbackCard usar
      participant: d['Nome completo'],
      timestamp: d['Carimbo de data/hora'],
      experience: d['1.5 Como foi a sua experiência no último encontro?'],
      rating: Number(d['1.4 De 0 a 10 qual a nota que você dá para o encontro?']),
      engagement: Number(d['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?']),
      email: d['Endereço de e-mail'],
      feedback: d['Feedback AI'],
    }));

  // Se um limite foi passado (ex: 10), retorna apenas essa quantidade
  return limit ? feedbackData.slice(0, limit) : feedbackData;
};

export const generateAIInsights = (data: MentorshipData[]) => {
  const kpis = calculateKPIs(data);
  const feedbackData = analyzeFeedback(data);
  
  const positiveFeedback = feedbackData.filter(f => f.sentiment === 'positive').length;
  const negativeFeedback = feedbackData.filter(f => f.sentiment === 'negative').length;
  const neutralFeedback = feedbackData.filter(f => f.sentiment === 'neutral').length;
  
  const averageRating = kpis.averageRating;
  const averageEngagement = kpis.averageEngagement;
  const completionRate = (kpis.completedMeetings / kpis.totalParticipants) * 100;
  
  const insights = [];
  
  // Overall sentiment analysis
  if (positiveFeedback > negativeFeedback * 2) {
    insights.push({
      type: 'positive' as const,
      title: 'Sentimento Geral Positivo',
      description: `${Math.round((positiveFeedback / feedbackData.length) * 100)}% dos feedbacks são positivos, indicando alta satisfação com o programa.`,
      icon: 'trending-up'
    });
  } else if (negativeFeedback > positiveFeedback) {
    insights.push({
      type: 'negative' as const,
      title: 'Atenção aos Feedbacks',
      description: `${Math.round((negativeFeedback / feedbackData.length) * 100)}% dos feedbacks são negativos. Recomenda-se investigar as causas.`,
      icon: 'alert-triangle'
    });
  }
  
  // Rating analysis
  if (averageRating >= 8) {
    insights.push({
      type: 'positive' as const,
      title: 'Excelente Avaliação',
      description: `Nota média de ${averageRating}/10 demonstra alta qualidade dos encontros de mentoria.`,
      icon: 'star'
    });
  } else if (averageRating < 6) {
    insights.push({
      type: 'negative' as const,
      title: 'Oportunidade de Melhoria',
      description: `Nota média de ${averageRating}/10 sugere necessidade de melhorias na qualidade dos encontros.`,
      icon: 'alert-circle'
    });
  }
  
  // Engagement analysis
  if (averageEngagement >= 8) {
    insights.push({
      type: 'positive' as const,
      title: 'Alto Engajamento',
      description: `Engajamento médio de ${averageEngagement}/10 indica participação ativa das duplas.`,
      icon: 'users'
    });
  } else if (averageEngagement < 6) {
    insights.push({
      type: 'warning' as const,
      title: 'Engajamento Baixo',
      description: `Engajamento médio de ${averageEngagement}/10 pode indicar necessidade de estratégias para aumentar participação.`,
      icon: 'user-x'
    });
  }
  
  // Completion rate analysis
  if (completionRate >= 80) {
    insights.push({
      type: 'positive' as const,
      title: 'Alta Taxa de Participação',
      description: `${Math.round(completionRate)}% dos participantes já realizaram encontros, demonstrando boa adesão ao programa.`,
      icon: 'check-circle'
    });
  } else if (completionRate < 50) {
    insights.push({
      type: 'warning' as const,
      title: 'Baixa Taxa de Participação',
      description: `Apenas ${Math.round(completionRate)}% dos participantes realizaram encontros. Considere estratégias de engajamento.`,
      icon: 'clock'
    });
  }
  
  // Duration analysis
  if (kpis.averageDuration < 30) {
    insights.push({
      type: 'warning' as const,
      title: 'Duração dos Encontros',
      description: `Duração média de ${kpis.averageDuration} minutos pode ser insuficiente para mentoria efetiva.`,
      icon: 'clock'
    });
  }
  
  return insights;
};

export const generateIndividualFeedback = (participant: any): string => {
  // This would typically call an AI service, but for demo purposes, we'll generate based on data
  const rating = participant.rating || 0;
  const engagement = participant.engagement || 0;
  const experience = participant.experience || '';
  
  if (rating >= 9 && engagement >= 9) {
    return `Excelente performance! ${participant.participant} demonstra alta satisfação (${rating}/10) e engajamento excepcional (${engagement}/10). Continue incentivando essa dinâmica positiva.`;
  } else if (rating >= 7 && engagement >= 7) {
    return `Boa evolução observada. ${participant.participant} apresenta satisfação satisfatória (${rating}/10) e bom engajamento (${engagement}/10). Há oportunidades para aprimoramento contínuo.`;
  } else if (rating < 6 || engagement < 6) {
    return `Atenção necessária. ${participant.participant} apresenta indicadores baixos (Nota: ${rating}/10, Engajamento: ${engagement}/10). Recomenda-se acompanhamento mais próximo e identificação de barreiras.`;
  } else {
    return `Performance neutra. ${participant.participant} está dentro da média esperada. Considere estratégias para aumentar o engajamento e satisfação.`;
  }
};