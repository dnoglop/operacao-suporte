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

export const analyzeFeedback = (data: MentorshipData[]) => {
  return data
    .filter(d => d['Feedback AI'] && d['Feedback AI'] !== '.' && d['Feedback AI'].trim() !== '')
    .map(d => {
      const feedback = d['Feedback AI'];
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      
      // Enhanced sentiment analysis
      const positiveKeywords = ['positivo', 'excelente', 'ótimo', 'bom', 'satisfação', 'sucesso', 'bem', 'alta', 'promissor', 'bacana', 'feliz'];
      const negativeKeywords = ['negativo', 'problema', 'ruim', 'baixo', 'dificuldade', 'preocupação', 'insatisfação', 'falha'];
      
      const lowerFeedback = feedback.toLowerCase();
      
      if (positiveKeywords.some(keyword => lowerFeedback.includes(keyword))) {
        sentiment = 'positive';
      } else if (negativeKeywords.some(keyword => lowerFeedback.includes(keyword))) {
        sentiment = 'negative';
      }
      
      return {
        feedback,
        participant: d['Nome completo'],
        timestamp: d['Carimbo de data/hora'],
        sentiment,
        experience: d['1.5 Como foi a sua experiência no último encontro?'],
        rating: d['1.4 De 0 a 10 qual a nota que você dá para o encontro?'],
        engagement: d['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?']
      };
    });
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