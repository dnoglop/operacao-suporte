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

  // Program distribution
  const programDistribution = [...new Set(data.map(d => d['Qual o programa que está participando?']))]
    .map(program => ({
      name: program.split(' - ')[1] || program,
      value: data.filter(d => d['Qual o programa que está participando?'] === program).length
    }));

  // Role distribution
  const roleDistribution = [
    { name: 'Mentores', value: data.filter(d => d['Você é?'] === 'Mentor(a)').length },
    { name: 'Mentorados', value: data.filter(d => d['Você é?'] === 'Mentorado(a)').length }
  ];

  // Meeting frequency
  const meetingFrequency = [
    { name: '0 encontros', value: data.filter(d => d['1.2 Qual encontro foi realizado?'] === 0).length },
    { name: '1 encontro', value: data.filter(d => d['1.2 Qual encontro foi realizado?'] === 1).length },
    { name: '2 encontros', value: data.filter(d => d['1.2 Qual encontro foi realizado?'] === 2).length },
    { name: '3+ encontros', value: data.filter(d => d['1.2 Qual encontro foi realizado?'] >= 3).length }
  ];

  return {
    ratingDistribution,
    programDistribution,
    roleDistribution,
    meetingFrequency
  };
};

export const analyzeFeedback = (data: MentorshipData[]) => {
  return data
    .filter(d => d['Feedback AI'] && d['Feedback AI'] !== '.')
    .map(d => ({
      feedback: d['Feedback AI'],
      participant: d['Nome completo'],
      timestamp: d['Carimbo de data/hora'],
      sentiment: d['Feedback AI'].toLowerCase().includes('positivo') || d['Feedback AI'].toLowerCase().includes('excelente') ? 'positive' as const :
                 d['Feedback AI'].toLowerCase().includes('negativo') || d['Feedback AI'].toLowerCase().includes('problema') ? 'negative' as const :
                 'neutral' as const
    }));
};