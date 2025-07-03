export interface MentorshipData {
  'Carimbo de data/hora': string;
  'Endereço de e-mail': string;
  'Nome completo': string;
  'Telefone com DDD': number;
  'Você é?': 'Mentor(a)' | 'Mentorado(a)';
  'Qual o programa que está participando?': string;
  'Quantos encontros já foram realizados?': string;
  '1.2 Qual encontro foi realizado?': number;
  '1.3 Quantos minutos durou o encontro?': number;
  '1.4 De 0 a 10 qual a nota que você dá para o encontro?': number;
  '1.5 Como foi a sua experiência no último encontro?': string;
  '1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?': number;
  '1.7 Você tem alguma dúvida, comentário ou sugestão?': string;
  'Comentários Joule': string;
  'Feedback AI': string;
  'Validação': 'TRUE' | 'FALSE';
}

export interface KPIData {
  label: string;
  value: number | string;
  change: number;
  icon: string;
  color: string;
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}