// src/utils/analytics.ts

import { MentorshipData, FeedbackItem } from '../types';

// Função de parse de data corrigida para formato DD/MM/YYYY
export const parseDate = (dateStr: string): Date => {
  if (!dateStr || typeof dateStr !== 'string') {
    console.warn('Data inválida ou vazia:', dateStr);
    return new Date(0);
  }

  // Remove espaços extras
  const cleanDateStr = dateStr.trim();
  
  // Formato principal esperado: DD/MM/YYYY HH:MM:SS
  let parts = cleanDateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(.*)$/);
  if (parts) {
    const day = parts[1].padStart(2, '0');
    const month = parts[2].padStart(2, '0');
    const year = parts[3];
    const time = parts[4];
    
    // Constrói a data no formato ISO: YYYY-MM-DDTHH:MM:SS
    const isoDate = `${year}-${month}-${day}T${time}`;
    const date = new Date(isoDate);
    
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Formato alternativo: DD/MM/YYYY (sem horário)
  parts = cleanDateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (parts) {
    const day = parts[1].padStart(2, '0');
    const month = parts[2].padStart(2, '0');
    const year = parts[3];
    
    const isoDate = `${year}-${month}-${day}T00:00:00`;
    const date = new Date(isoDate);
    
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Formato MM/DD/YYYY (formato americano, caso apareça)
  parts = cleanDateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(.*)$/);
  if (parts) {
    // Tenta primeiro como DD/MM/YYYY, depois como MM/DD/YYYY
    const firstNum = parseInt(parts[1]);
    const secondNum = parseInt(parts[2]);
    
    // Se o primeiro número é > 12, provavelmente é dia
    if (firstNum > 12) {
      const day = parts[1].padStart(2, '0');
      const month = parts[2].padStart(2, '0');
      const year = parts[3];
      const time = parts[4];
      
      const isoDate = `${year}-${month}-${day}T${time}`;
      const date = new Date(isoDate);
      
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  // Formato de ano com 2 dígitos: DD/MM/YY
  parts = cleanDateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})\s+(.*)$/);
  if (parts) {
    const day = parts[1].padStart(2, '0');
    const month = parts[2].padStart(2, '0');
    const year = parseInt(parts[3], 10);
    const fullYear = year < 50 ? 2000 + year : 1900 + year; // Assume 2000+ para anos < 50
    const time = parts[4];
    
    const isoDate = `${fullYear}-${month}-${day}T${time}`;
    const date = new Date(isoDate);
    
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Último recurso: tenta o construtor Date nativo
  const fallbackDate = new Date(cleanDateStr);
  if (!isNaN(fallbackDate.getTime())) {
    return fallbackDate;
  }

  console.error('Não foi possível fazer parse da data:', dateStr);
  return new Date(0); // Retorna época Unix como fallback
};

// Função auxiliar para debug de datas
export const debugDate = (dateStr: string) => {
  console.log('Data original:', dateStr);
  const parsed = parseDate(dateStr);
  console.log('Data parseada:', parsed);
  console.log('É válida?', !isNaN(parsed.getTime()));
  console.log('Timestamp:', parsed.getTime());
  return parsed;
};

// Função para normalizar datas para comparação (apenas data, sem horário)
export const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

// Função melhorada para filtrar dados por data
export const filterDataByDateRange = (data: MentorshipData[], startDate?: Date, endDate?: Date) => {
  if (!startDate || !endDate) {
    return data;
  }

  const normalizedStart = normalizeDate(startDate);
  const normalizedEnd = normalizeDate(endDate);
  
  return data.filter(d => {
    // CORREÇÃO: Verifica se o campo é um objeto Date antes de tentar fazer o parse
    const dateValue = d['Carimbo de data/hora'];
    if (!dateValue) return false;

    let itemDate;
    if (dateValue instanceof Date) {
        itemDate = dateValue; // Já é um objeto Date, usa diretamente
    } else if (typeof dateValue === 'string') {
        itemDate = parseDate(dateValue); // É uma string, faz o parse
    } else {
        return false; // Formato desconhecido
    }
    
    if (isNaN(itemDate.getTime())) return false;
    
    const normalizedItemDate = normalizeDate(itemDate);
    
    return normalizedItemDate >= normalizedStart && normalizedItemDate <= normalizedEnd;
  });
};

// Função calculateKPIs atualizada
export const calculateKPIs = (data: MentorshipData[], startDate?: Date, endDate?: Date) => {
  // O parâmetro 'data' já vem filtrado do componente App.tsx.
  const filteredData = data;
  
  if (!filteredData || filteredData.length === 0) {
    return { 
      totalParticipants: 0, 
      activeMentors: 0, 
      activeMentees: 0, 
      completedMeetings: 0, 
      averageRating: 0, 
      averageEngagement: 0, 
      averageDuration: 0,
      respostasDeMentores: 0,
      respostasDeMentorados: 0
    };
  }
  
  const toNumber = (value: any) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const validRatings = filteredData.filter(d => toNumber(d['1.4 De 0 a 10 qual a nota que você dá para o encontro?']) > 0);
  const validEngagements = filteredData.filter(d => toNumber(d['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?']) > 0);
  const validDurations = filteredData.filter(d => toNumber(d['1.3 Quantos minutos durou o encontro?']) > 0);

  const totalRating = validRatings.reduce((sum, d) => sum + toNumber(d['1.4 De 0 a 10 qual a nota que você dá para o encontro?']), 0);
  const averageRating = validRatings.length > 0 ? totalRating / validRatings.length : 0;
  
  const totalEngagement = validEngagements.reduce((sum, d) => sum + toNumber(d['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?']), 0);
  const averageEngagement = validEngagements.length > 0 ? totalEngagement / validEngagements.length : 0;
  
  const totalDuration = validDurations.reduce((sum, d) => sum + toNumber(d['1.3 Quantos minutos durou o encontro?']), 0);
  const averageDuration = validDurations.length > 0 ? totalDuration / validDurations.length : 0;

  const uniqueMentors = new Set(filteredData.filter(d => d['Você é?'] === 'Mentor(a)').map(d => d['Endereço de e-mail']));
  const uniqueMentees = new Set(filteredData.filter(d => d['Você é?'] === 'Mentorado(a)').map(d => d['Endereço de e-mail']));

  return {
    activeMentors: filteredData.filter(d => d['Você é?'] === 'Mentor(a)').length,
    activeMentees: filteredData.filter(d => d['Você é?'] === 'Mentorado(a)').length,
    respostasDeMentores: uniqueMentors.size,
    respostasDeMentorados: uniqueMentees.size,
    completedMeetings: filteredData.filter(d => d['Quantos encontros já foram realizados?'] === 'Já realizei um ou mais encontro').length,
    averageRating: Math.round(averageRating * 10) / 10 || 0,
    averageEngagement: Math.round(averageEngagement * 10) / 10 || 0,
    averageDuration: Math.round(averageDuration) || 0,
  };
};

// Função generateChartData atualizada
export const generateChartData = (data: MentorshipData[], startDate?: Date, endDate?: Date) => {
  const filteredData = data;

  if (!filteredData || filteredData.length === 0) {
    return { 
      ratingDistribution: [], 
      programDistribution: [], 
      engagementDistribution: [], 
      durationDistribution: [] 
    };
  }

  // Resto da função permanece igual...
  const ratingCounts: { [key: string]: number } = {};
  filteredData.forEach(d => {
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
  filteredData.forEach(d => {
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
  filteredData.forEach(d => {
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
  filteredData.forEach(d => {
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
export const analyzeFeedback = (data: MentorshipData[], limit?: number, startDate?: Date, endDate?: Date): FeedbackItem[] => {
  if (!data) return [];
  
  const filteredData = data;
  
  const feedbackData = filteredData
    .filter(d => d['Quantos encontros já foram realizados?'] === 'Já realizei um ou mais encontro')
    .sort((a, b) => {
        const dateA = a['Carimbo de data/hora'];
        const dateB = b['Carimbo de data/hora'];
        return dateB.getTime() - dateA.getTime();
    })
    .map((d): FeedbackItem => ({
      ...d,
      sentiment: getSentiment(d),
      participant: d['Nome completo'],
      timestamp: d['Carimbo de data/hora'],
      experience: d['1.5 Como foi a sua experiência no último encontro?'],
      rating: Number(d['1.4 De 0 a 10 qual a nota que você dá para o encontro?']) || 0,
      engagement: Number(d['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?']) || 0,
      email: d['Endereço de e-mail'],
      feedback: d['Feedback AI'],
    }));

  return limit ? feedbackData.slice(0, limit) : feedbackData;
};

export const generateAIInsights = async (data: MentorshipData[], startDate?: Date, endDate?: Date) => {
  const kpis = calculateKPIs(data, startDate, endDate);
  // CORREÇÃO: A linha abaixo foi re-adicionada para definir a variável feedbackData.
  const feedbackData = analyzeFeedback(data, undefined, startDate, endDate);
  const growthIndicators = calculateKPIGrowthIndicators(data, startDate || new Date(0), endDate || new Date());

  const prompt = `
  Você é um especialista em análise de dados de programas de mentoria. Sua tarefa é gerar insights acionáveis para os coordenadores do programa com base nos dados fornecidos.

  Dados do Programa (KPIs):
  - Respostas de Mentores: ${kpis.respostasDeMentores} (Crescimento: ${growthIndicators.respostasDeMentoresChange.toFixed(1)}%)
  - Respostas de Mentorados: ${kpis.respostasDeMentorados} (Crescimento: ${growthIndicators.respostasDeMentoradosChange.toFixed(1)}%)
  - Encontros Realizados: ${kpis.completedMeetings} (Crescimento: ${growthIndicators.completedMeetingsChange.toFixed(1)}%)
  - Nota Média dos Encontros: ${kpis.averageRating}/10 (Crescimento: ${growthIndicators.averageRatingChange.toFixed(1)}%)
  - Duração Média dos Encontros: ${kpis.averageDuration} minutos (Crescimento: ${growthIndicators.averageDurationChange.toFixed(1)}%)
  - Engajamento Médio da Dupla: ${kpis.averageEngagement}/10 (Crescimento: ${growthIndicators.averageEngagementChange.toFixed(1)}%)

  Feedbacks Recentes (últimos 3, se disponíveis):
  ${feedbackData.slice(0, 3).map(f => `- Participante: ${f.participant}, Nota: ${f.rating}, Engajamento: ${f.engagement}, Experiência: ${f.experience}`).join('\n') || 'Nenhum feedback recente disponível.'}

  Com base nesses dados, gere uma lista de insights no formato JSON. Cada insight deve ter as seguintes propriedades:
  - type: 'positive' | 'negative' | 'warning' | 'neutral'
  - title: Título conciso do insight
  - description: Descrição detalhada do insight
  - icon: Nome do ícone (escolha entre 'award', 'star', 'alert-circle', 'users', 'user-x', 'clock', 'trending-up', 'alert-triangle', 'check-circle')

  Exemplo de formato JSON:
  [
    {
      "type": "positive",
      "title": "Alta Satisfação Geral",
      "description": "A nota média dos encontros e o engajamento da dupla estão consistentemente altos, indicando um programa de mentoria bem-sucedido.",
      "icon": "award"
    }
  ]

  Gere no mínimo 3 e no máximo 5 insights. Priorize insights que sejam acionáveis e relevantes para a melhoria ou reconhecimento do programa.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonString = text.replace(/^\s*```json\s*\n|\n\s*```\s*$/g, '');

    try {
      const insights = JSON.parse(jsonString);
      if (Array.isArray(insights) && insights.every(i => i.type && i.title && i.description && i.icon)) {
        return insights;
      } else {
        console.error("Formato de insights inválido retornado pela API Gemini:", text);
        return [{
          type: 'negative',
          title: 'Erro na Geração de Insights',
          description: 'A API retornou um formato de insights inesperado. Por favor, verifique a configuração ou tente novamente.',
          icon: 'alert-circle'
        }];
      }
    } catch (jsonError) {
      console.error("Erro ao parsear JSON da API Gemini:", jsonError, "Texto recebido:", text);
      return [{
        type: 'negative',
        title: 'Erro de Formato da API',
        description: 'Não foi possível processar a resposta da API. O formato JSON está incorreto.',
        icon: 'alert-circle'
      }];
    }

  } catch (error) {
    console.error("Erro ao gerar insights com a API Gemini:", error);
    return [{
      type: 'negative',
      title: 'Erro de Conexão com a API',
      description: 'Não foi possível gerar os insights no momento. Verifique sua conexão ou a chave da API.',
      icon: 'alert-circle'
    }];
  }
};

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.GEMINI_API_KEY;
console.log("GEMINI_API_KEY being used:", API_KEY);
console.log("GEMINI_API_KEY being used:", API_KEY);

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateIndividualFeedback = async (participant: any): Promise<string> => {
  const meetingNumber = Number(participant['1.2 Qual encontro foi realizado?']) || 0;
  const rating = Number(participant['1.4 De 0 a 10 qual a nota que você dá para o encontro?']) || 0;
  const experience = participant['1.5 Como foi a sua experiência no último encontro?'] || '';
  const engagement = Number(participant['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?']) || 0;
  const suggestion = participant['1.7 Você tem alguma dúvida, comentário ou sugestão?'] || '';

  const prompt = `
**Persona:** Você é um especialista em programas de mentoria, analisando feedbacks para gerar insights para os coordenadores. Sua linguagem é profissional, empática e construtiva.

**Contexto do Programa:** O participante está em um programa de mentoria para desenvolvimento de carreira. O engajamento e a qualidade dos encontros são cruciais.

Feedback do Participante:
- Nome: ${participant['Nome completo']}
- Número do Encontro: ${meetingNumber}
- Nota do Encontro (0-10): ${rating}
- Nota de Engajamento da Dupla (0-10): ${engagement}
- Descrição da Experiência: "${experience}"
- Dúvidas ou Sugestões: "${suggestion}"

**Sua Tarefa:**
Gere uma análise concisa seguindo ESTRITAMENTE o formato Markdown abaixo.

### Análise de Sentimento
Identifique o sentimento geral (Positivo, Neutro, Alerta Necessário) e justifique em uma única frase.

### Pontos de Destaque
- Liste 1-2 pontos positivos do feedback. Se não houver, escreva "Nenhum ponto de destaque identificado".

### Pontos de Atenção
- Liste 1-2 pontos que requerem atenção. Se não houver, escreva "Nenhum ponto de atenção identificado".

---

### Plano de Ação Sugerido
- Sugira 1-2 ações concretas para o coordenador. A resposta deve ser clara e acionável. Se o feedback for inteiramente positivo, sugira como reconhecer o sucesso. Se nenhuma ação for necessária, escreva "Nenhuma ação imediata necessária".
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Erro ao gerar feedback com a API Gemini:", error);
    return "Não foi possível gerar a análise no momento. Por favor, tente novamente mais tarde.";
  }
};


/**
 * Calcula a variação percentual entre dois números e arredonda para uma casa decimal.
 * @param current O valor atual.
 * @param previous O valor anterior.
 * @returns A variação percentual arredondada.
 */
const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  const change = ((current - previous) / previous) * 100;
  return parseFloat(change.toFixed(1));
};

/**
 * Calcula os indicadores de crescimento dos KPIs comparando o período atual com o anterior.
 * @param allData O conjunto de dados completo, sem filtros de data.
 * @param currentStartDate A data de início do período atual.
 * @param currentEndDate A data de fim do período atual.
 * @returns Um objeto com a variação percentual para cada KPI.
 */
export const calculateKPIGrowthIndicators = (
  allData: MentorshipData[],
  currentStartDate: Date,
  currentEndDate: Date
) => {
  const duration = currentEndDate.getTime() - currentStartDate.getTime();
  if (duration <= 0) {
    return {
      respostasDeMentoresChange: 0,
      respostasDeMentoradosChange: 0,
      completedMeetingsChange: 0,
      averageRatingChange: 0,
      averageDurationChange: 0,
      averageEngagementChange: 0,
    };
  }

  const previousEndDate = new Date(currentStartDate.getTime() - 1);
  const previousStartDate = new Date(previousEndDate.getTime() - duration);

  const currentPeriodData = filterDataByDateRange(allData, currentStartDate, currentEndDate);
  const previousPeriodData = filterDataByDateRange(allData, previousStartDate, previousEndDate);
  
  const currentKPIs = calculateKPIs(currentPeriodData);
  const previousKPIs = calculateKPIs(previousPeriodData);

  return {
    respostasDeMentoresChange: calculatePercentageChange(
      currentKPIs.respostasDeMentores,
      previousKPIs.respostasDeMentores
    ),
    respostasDeMentoradosChange: calculatePercentageChange(
      currentKPIs.respostasDeMentorados,
      previousKPIs.respostasDeMentorados
    ),
    completedMeetingsChange: calculatePercentageChange(
      currentKPIs.completedMeetings,
      previousKPIs.completedMeetings
    ),
    averageRatingChange: calculatePercentageChange(
      currentKPIs.averageRating,
      previousKPIs.averageRating
    ),
    averageDurationChange: calculatePercentageChange(
      currentKPIs.averageDuration,
      previousKPIs.averageDuration
    ),
    averageEngagementChange: calculatePercentageChange(
      currentKPIs.averageEngagement,
      previousKPIs.averageEngagement
    ),
  };
};

export const calculateKPIGrowth = calculateKPIGrowthIndicators;