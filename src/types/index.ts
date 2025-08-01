// src/types/index.ts

export interface MentorshipData {
  'Carimbo de data/hora': string;
  'Endereço de e-mail': string;
  'Nome completo': string;
  'Telefone com DDD': string | number;
  'Você é?': string;
  'Qual o programa que está participando?': string;
  'Quantos encontros já foram realizados?': string;
  '1.2 Qual encontro foi realizado?': number | string;
  '1.3 Quantos minutos durou o encontro?': number | string;
  '1.4 De 0 a 10 qual a nota que você dá para o encontro?': number | string;
  '1.5 Como foi a sua experiência no último encontro?': string;
  '1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?': number | string;
  '1.7 Você tem alguma dúvida, comentário ou sugestão?': string;
  'Comentários Joule': string;
  'Feedback AI': string;
  'Validação': 'TRUE' | 'VERDADEIRO' | 'FALSO' | 'FALSE' | string;
}

// Este tipo será usado nos componentes de Feedback
export interface FeedbackItem extends MentorshipData {
  sentiment: 'positive' | 'neutral' | 'negative';
  // Adicione outras propriedades se você mapeá-las na função `analyzeFeedback`
  participant?: string;
  timestamp?: string;
  experience?: string;
  rating?: number;
  engagement?: number;
  email?: string;
  feedback?: string;
}

export interface KPIData {
  label: string;
  value: number | string;
  change: number;
  icon: string;
  color: string;
}

export interface ChartData {
  ratingDistribution: { name: string; value: number; }[];
  programDistribution: { name: string; value: number; }[];
  engagementDistribution: { name: string; value: number; }[];
  durationDistribution: { name: string; value: number; }[];
}