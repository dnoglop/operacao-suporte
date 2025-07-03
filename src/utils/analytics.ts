import { MentorshipData } from '../types';

export const calculateKPIs = (data: MentorshipData[]) => {
  const totalParticipants = data.length;
  const activeMentors = data.filter(d => d['Você é?'] === 'Mentor(a)').length;
  const activeMentees = data.filter(d => d['Você é?'] === 'Mentorado(a)').length;
  
  const completedMeetings = data.filter(d => d['1.2 Qual encontro foi realizado?'] > 0).length;
  const averageRating = data
    .filter(d => d['1.4 De 0 a 10 qual a nota que você dá para o encontro?'] > 0)
    .reduce((sum, d) => sum + d['1.4 De 0 a 10 qual a nota que você dá para o encontro?'], 0) / 
    data.filter(d => d['1.4 De 0 a 10 qual a nota que você dá para o encontro?'] > 0).length;
  
  const averageEngagement = data
    .filter(d => d['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?'] > 0)
    .reduce((sum, d) => sum + d['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?'], 0) / 
    data.filter(d => d['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?'] > 0).length;
    
  const averageDuration = data
    .filter(d => d['1.3 Quantos minutos durou o encontro?'] > 0)
    .reduce((sum, d) => sum + d['1.3 Quantos minutos durou o encontro?'], 0) / 
    data.filter(d => d['1.3 Quantos minutos durou o encontro?'] > 0).length;

  const validatedParticipants = data.filter(d => d['Validação'] === 'TRUE').length;

  return {
    totalParticipants,
    activeMentors,
    activeMentees,
    completedMeetings,
    averageRating: Math.round(averageRating * 10) / 10,
    averageEngagement: Math.round(averageEngagement * 10) / 10,
    averageDuration: Math.round(averageDuration),
    validatedParticipants
  };
};

export const calculateKPIGrowth = (data: MentorshipData[]) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Parse dates and filter data
  const parseDate = (dateStr: string) => {
    try {
      const [datePart, timePart] = dateStr.split(' ');
      const [day, month, year] = datePart.split('/');
      return new Date(`${year}-${month}-${day}T${timePart}`);
    } catch {
      return new Date(0);
    }
  };
  
  const recentData = data.filter(d => {
    try {
      const date = parseDate(d['Carimbo de data/hora']);
      return date >= sevenDaysAgo;
    } catch {
      return false;
    }
  });
  
  const olderData = data.filter(d => {
    try {
      const date = parseDate(d['Carimbo de data/hora']);
      return date < sevenDaysAgo;
    } catch {
      return true;
    }
  });
  
  const recentKPIs = calculateKPIs(recentData);
  const olderKPIs = calculateKPIs(olderData);
  
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };
  
  return {
    totalParticipants: calculateGrowth(recentKPIs.totalParticipants, olderKPIs.totalParticipants),
    completedMeetings: calculateGrowth(recentKPIs.completedMeetings, olderKPIs.completedMeetings),
    averageRating: calculateGrowth(recentKPIs.averageRating, olderKPIs.averageRating),
    averageDuration: calculateGrowth(recentKPIs.averageDuration, olderKPIs.averageDuration),
    averageEngagement: calculateGrowth(recentKPIs.averageEngagement, olderKPIs.averageEngagement),
    validatedParticipants: calculateGrowth(recentKPIs.validatedParticipants, olderKPIs.validatedParticipants)
  };
};

export const generateChartData = (data: MentorshipData[]) => {
  // Rating distribution
  const ratingDistribution = [
    { name: '0-2', value: data.filter(d => d['1.4 De 0 a 10 qual a nota que você dá para o encontro?'] <= 2).length },
    { name: '3-5', value: data.filter(d => d['1.4 De 0 a 10 qual a nota que você dá para o encontro?'] >= 3 && d['1.4 De 0 a 10 qual a nota que você dá para o encontro?'] <= 5).length },
    { name: '6-8', value: data.filter(d => d['1.4 De 0 a 10 qual a nota que você dá para o encontro?'] >= 6 && d['1.4 De 0 a 10 qual a nota que você dá para o encontro?'] <= 8).length },
    { name: '9-10', value: data.filter(d => d['1.4 De 0 a 10 qual a nota que você dá para o encontro?'] >= 9).length }
  ];

  // Program distribution with shortened names
  const programDistribution = [...new Set(data.map(d => d['Qual o programa que está participando?']))]
    .map(program => {
      let shortName = program;
      
      // Extract meaningful short names from program titles
      if (program.includes('Acelerando Carreiras')) {
        shortName = `Acelerando Carreiras (${program.match(/Turma \d+/)?.[0] || 'T?'})`;
      } else if (program.includes('Liderança Técnica')) {
        shortName = `Liderança Técnica (${program.match(/Turma \d+/)?.[0] || 'T?'})`;
      } else if (program.includes('Inovação Digital')) {
        shortName = `Inovação Digital (${program.match(/Turma \d+/)?.[0] || 'T?'})`;
      } else if (program.includes('Mentoria')) {
        shortName = `Mentoria (${program.match(/Turma \d+/)?.[0] || 'T?'})`;
      } else if (program.includes('Talentos Femininos')) {
        shortName = `Talentos Femininos (${program.match(/Turma \d+/)?.[0] || 'T?'})`;
      } else {
        // Fallback: take first 3 words and add turma info
        const words = program.split(' ');
        const turma = program.match(/Turma \d+/)?.[0] || '';
        shortName = `${words.slice(0, 3).join(' ')} ${turma}`.trim();
      }
      
      return {
        name: shortName,
        value: data.filter(d => d['Qual o programa que está participando?'] === program).length,
        fullName: program
      };
    });

  // Role distribution
  const roleDistribution = [
    { name: 'Mentores', value: data.filter(d => d['Você é?'] === 'Mentor(a)').length },
    { name: 'Mentorados', value: data.filter(d => d['Você é?'] === 'Mentorado(a)').length }
  ];

  // Meeting frequency - Updated to show 1-8 meetings
  const meetingFrequency = [
    { name: '1 encontro', value: data.filter(d => d['1.2 Qual encontro foi realizado?'] === 1).length },
    { name: '2 encontros', value: data.filter(d => d['1.2 Qual encontro foi realizado?'] === 2).length },
    { name: '3 encontros', value: data.filter(d => d['1.2 Qual encontro foi realizado?'] === 3).length },
    { name: '4 encontros', value: data.filter(d => d['1.2 Qual encontro foi realizado?'] === 4).length },
    { name: '5 encontros', value: data.filter(d => d['1.2 Qual encontro foi realizado?'] === 5).length },
    { name: '6 encontros', value: data.filter(d => d['1.2 Qual encontro foi realizado?'] === 6).length },
    { name: '7 encontros', value: data.filter(d => d['1.2 Qual encontro foi realizado?'] === 7).length },
    { name: '8+ encontros', value: data.filter(d => d['1.2 Qual encontro foi realizado?'] >= 8).length }
  ].filter(item => item.value > 0); // Only show categories with data

  return {
    ratingDistribution,
    programDistribution,
    roleDistribution,
    meetingFrequency
  };
};

export const analyzeFeedback = (data: MentorshipData[], limit?: number) => {
  // Parse dates and sort by most recent first
  const parseDate = (dateStr: string) => {
    try {
      const [datePart, timePart] = dateStr.split(' ');
      const [day, month, year] = datePart.split('/');
      return new Date(`${year}-${month}-${day}T${timePart}`);
    } catch {
      return new Date(0); // Fallback for invalid dates
    }
  };

  // Filter participants who have experience to share (not just AI feedback)
  const feedbackData = data
    .filter(d => {
      const hasExperience = d['1.5 Como foi a sua experiência no último encontro?'] && 
                           d['1.5 Como foi a sua experiência no último encontro?'].trim() !== '' && 
                           d['1.5 Como foi a sua experiência no último encontro?'] !== 'Ainda não realizado';
      const hasComments = d['1.7 Você tem alguma dúvida, comentário ou sugestão?'] && 
                         d['1.7 Você tem alguma dúvida, comentário ou sugestão?'].trim() !== '';
      return hasExperience || hasComments;
    })
    .sort((a, b) => parseDate(b['Carimbo de data/hora']).getTime() - parseDate(a['Carimbo de data/hora']).getTime())
    .map(d => {
      const feedback = d['Feedback AI'] || '';
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      
      // Enhanced sentiment analysis based on rating and experience
      const rating = d['1.4 De 0 a 10 qual a nota que você dá para o encontro?'];
      const engagement = d['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?'];
      const experience = d['1.5 Como foi a sua experiência no último encontro?'] || '';
      
      // Determine sentiment based on multiple factors
      if (rating >= 8 && engagement >= 8) {
        sentiment = 'positive';
      } else if (rating <= 5 || engagement <= 5) {
        sentiment = 'negative';
      } else {
        // Check experience text for sentiment keywords
        const lowerExperience = experience.toLowerCase();
        const positiveKeywords = ['excelente', 'ótimo', 'bom', 'bacana', 'incrível', 'útil', 'esclarecedor', 'produtivo', 'animada'];
        const negativeKeywords = ['ruim', 'problema', 'dificuldade', 'esperava mais', 'poderia', 'falta'];
        
        if (positiveKeywords.some(keyword => lowerExperience.includes(keyword))) {
          sentiment = 'positive';
        } else if (negativeKeywords.some(keyword => lowerExperience.includes(keyword))) {
          sentiment = 'negative';
        }
      }
      
      return {
        feedback,
        participant: d['Nome completo'],
        timestamp: d['Carimbo de data/hora'],
        sentiment,
        experience: d['1.5 Como foi a sua experiência no último encontro?'],
        rating: d['1.4 De 0 a 10 qual a nota que você dá para o encontro?'],
        engagement: d['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?'],
        email: d['Endereço de e-mail']
      };
    });

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