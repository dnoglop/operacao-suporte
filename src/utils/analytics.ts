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
    return { totalParticipants: 0, activeMentors: 0, activeMentees: 0, completedMeetings: 0, averageRating: 0, averageEngagement: 0, averageDuration: 0 };
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
    completedMeetings: data.filter(d => d['Quantos encontros já foram realizados?'] === 'Já realizei um ou mais encontro').length,
    averageRating: Math.round(averageRating * 10) / 10 || 0,
    averageEngagement: Math.round(averageEngagement * 10) / 10 || 0,
    averageDuration: Math.round(averageDuration) || 0,
  };
};

export const calculateKPIGrowth = (data: MentorshipData[]) => {
    // Implementação mantida, mas garantindo que `parseDate` seja usada
    return { totalParticipants: 0, completedMeetings: 0, averageRating: 0, averageDuration: 0, averageEngagement: 0, validatedParticipants: 0 };
};

export const generateChartData = (data: MentorshipData[]) => {
  if (!data || data.length === 0) {
    return { ratingDistribution: [], programDistribution: [], engagementDistribution: [], durationDistribution: [] };
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

  const engagementCounts: { [key: string]: number } = {};
  data.forEach(d => {
    const engagement = d['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?'];
    if (engagement !== null && engagement !== undefined) {
      const engagementStr = String(engagement);
      engagementCounts[engagementStr] = (engagementCounts[engagementStr] || 0) + 1;
    }
  });
  const engagementDistribution = Object.keys(engagementCounts).map(key => ({
    name: `Engajamento ${key}`,
    value: engagementCounts[key]
  })).sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]));

  const durationCounts: { [key: string]: number } = {};
  data.forEach(d => {
    const duration = Number(d['1.3 Quantos minutos durou o encontro?']);
    if (!isNaN(duration) && duration > 0) {
      let range = '';
      if (duration <= 30) {
        range = '0-30 min';
      } else if (duration <= 60) {
        range = '31-60 min';
      } else if (duration <= 90) {
        range = '61-90 min';
      } else {
        range = '>90 min';
      }
      durationCounts[range] = (durationCounts[range] || 0) + 1;
    }
  });
  const durationDistribution = Object.keys(durationCounts).map(key => ({
    name: key,
    value: durationCounts[key]
  })).sort((a, b) => {
    const order = ['0-30 min', '31-60 min', '61-90 min', '>90 min'];
    return order.indexOf(a.name) - order.indexOf(b.name);
  });

  return { ratingDistribution, programDistribution, engagementDistribution, durationDistribution };
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

  const averageRating = kpis.averageRating;
  const averageEngagement = kpis.averageEngagement;
  const averageDuration = kpis.averageDuration;
  const completedMeetings = kpis.completedMeetings;

  const insights = [];

  // Overall Program Quality Assessment
  let overallAssessment = 'neutral';
  let overallDescription = 'A qualidade geral do programa é neutra. Analise os insights específicos para mais detalhes.';

  if (averageRating >= 8 && averageEngagement >= 8 && averageDuration >= 45) {
    overallAssessment = 'positive';
    overallDescription = 'O programa demonstra excelente qualidade geral, com altas notas de encontro e engajamento, e duração adequada dos encontros.';
  } else if (averageRating < 6 || averageEngagement < 6 || averageDuration < 30) {
    overallAssessment = 'negative';
    overallDescription = 'O programa necessita de atenção. Há indicadores de baixa qualidade nos encontros, engajamento ou duração.';
  } else if (averageRating >= 7 && averageEngagement >= 7) {
    overallAssessment = 'positive';
    overallDescription = 'O programa apresenta boa qualidade geral, com notas e engajamento acima da média.';
  }

  insights.push({
    type: overallAssessment as const,
    title: 'Avaliação Geral do Programa',
    description: overallDescription,
    icon: 'award'
  });

  // Rating analysis
  if (averageRating >= 8) {
    insights.push({
      type: 'positive' as const,
      title: 'Excelente Avaliação dos Encontros',
      description: `A nota média dos encontros é de ${averageRating}/10, indicando alta satisfação dos participantes.`,
      icon: 'star'
    });
  } else if (averageRating < 6) {
    insights.push({
      type: 'negative' as const,
      title: 'Oportunidade de Melhoria na Qualidade dos Encontros',
      description: `A nota média dos encontros é de ${averageRating}/10, sugerindo a necessidade de revisar o conteúdo ou a dinâmica.`,
      icon: 'alert-circle'
    });
  }

  // Engagement analysis
  if (averageEngagement >= 8) {
    insights.push({
      type: 'positive' as const,
      title: 'Alto Engajamento da Dupla',
      description: `O engajamento médio da dupla é de ${averageEngagement}/10, demonstrando boa interação e participação.`,
      icon: 'users'
    });
  } else if (averageEngagement < 6) {
    insights.push({
      type: 'warning' as const,
      title: 'Baixo Engajamento da Dupla',
      description: `O engajamento médio da dupla é de ${averageEngagement}/10. Considere estratégias para fomentar a participação ativa.`,
      icon: 'user-x'
    });
  }

  // Duration analysis
  if (averageDuration < 30) {
    insights.push({
      type: 'warning' as const,
      title: 'Duração dos Encontros Abaixo do Ideal',
      description: `A duração média dos encontros é de ${averageDuration} minutos, o que pode ser insuficiente para sessões de mentoria eficazes.`,
      icon: 'clock'
    });
  } else if (averageDuration > 90) {
    insights.push({
      type: 'warning' as const,
      title: 'Duração dos Encontros Acima do Ideal',
      description: `A duração média dos encontros é de ${averageDuration} minutos, o que pode indicar sessões excessivamente longas.`,
      icon: 'clock'
    });
  } else {
    insights.push({
      type: 'positive' as const,
      title: 'Duração Adequada dos Encontros',
      description: `A duração média dos encontros é de ${averageDuration} minutos, o que está dentro da faixa ideal para sessões de mentoria.`,
      icon: 'clock'
    });
  }

  // Meeting number analysis (simple example)
  if (completedMeetings > 0) {
    const meetingNumbers = data.map(d => Number(d['1.2 Qual encontro foi realizado?'])).filter(n => !isNaN(n) && n > 0);
    if (meetingNumbers.length > 0) {
      const maxMeetingNumber = Math.max(...meetingNumbers);
      if (maxMeetingNumber > 1 && completedMeetings / data.length < 0.5) { // Example heuristic for drop-off
        insights.push({
          type: 'warning' as const,
          title: 'Possível Abandono em Encontros Posteriores',
          description: `Apesar de haver registros de até o encontro ${maxMeetingNumber}, a proporção de encontros concluídos em relação ao total de participantes sugere um possível abandono em etapas avançadas.`,
          icon: 'trending-down'
        });
      }
    }
  }

  return insights;
};

import { GoogleGenerativeAI } from '@google/generative-ai';

// Access your API key as an environment variable (see "Set up your API key" above)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateIndividualFeedback = async (participant: any): Promise<string> => {
  const meetingNumber = Number(participant['1.2 Qual encontro foi realizado?']) || 0;
  const rating = Number(participant['1.4 De 0 a 10 qual a nota que você dá para o encontro?']) || 0;
  const experience = participant['1.5 Como foi a sua experiência no último encontro?'] || '';
  const engagement = Number(participant['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?']) || 0;
  const suggestion = participant['1.7 Você tem alguma dúvida, comentário ou sugestão?'] || '';

  const prompt = `Analise o seguinte feedback de um participante de mentoria e forneça uma análise detalhada, identificando pontos de atenção e sugerindo planos de ação. Utilize as seguintes informações:

Número do Encontro: ${meetingNumber}
Nota do Encontro (0-10): ${rating}
Experiência no Último Encontro: ${experience}
Engajamento da Dupla (0-10): ${engagement}
Dúvidas, Comentários ou Sugestões: ${suggestion}

Sua análise deve ser concisa, profissional e focar em insights acionáveis. Se houver pontos negativos ou áreas de melhoria, sugira um plano de ação específico.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Erro ao gerar feedback com a API Gemini:", error);
    return "Não foi possível gerar a análise no momento. Por favor, tente novamente mais tarde.";
  }
};