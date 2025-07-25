// src/components/FeedbackCard.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertCircle, CheckCircle, Clock, Star, Users, Sparkles } from 'lucide-react';
import { generateIndividualFeedback } from '../utils/analytics';
import { FeedbackItem } from '../types'; // Importe o tipo unificado

interface FeedbackCardProps extends FeedbackItem {
  index: number;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = (props) => {
  const { 
    sentiment, 
    participant, 
    timestamp,
    experience,
    rating,
    engagement,
    email,
    index,
    'Feedback AI': aiFeedbackText // Renomeia a propriedade para uso local
  } = props;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFeedback, setGeneratedFeedback] = useState<string | null>(null);

  const sentimentConfig = {
    positive: { color: 'bg-green-100 text-green-800', icon: CheckCircle, border: 'border-green-200', label: 'Positivo' },
    neutral: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, border: 'border-yellow-200', label: 'Neutro' },
    negative: { color: 'bg-red-100 text-red-800', icon: AlertCircle, border: 'border-red-200', label: 'Negativo' }
  };

  const config = sentimentConfig[sentiment];
  const IconComponent = config.icon;

  const handleGenerateFeedback = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const aiResponse = generateIndividualFeedback(props); // Passa o objeto completo
    setGeneratedFeedback(aiResponse);
    setIsGenerating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border ${config.border}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg"><Brain className="h-5 w-5 text-blue-600" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-900 truncate">{participant}</p>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}><IconComponent className="h-3 w-3" /><span>{config.label}</span></div>
          </div>
          <div className="space-y-3">
            {aiFeedbackText && aiFeedbackText !== '.' && (
              <div className="bg-blue-50 rounded-lg p-3"><p className="text-sm text-blue-900 font-medium mb-1">Feedback existente:</p><p className="text-sm text-blue-800">{aiFeedbackText}</p></div>
            )}
            {experience && experience.trim() !== '' && (
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-sm text-gray-700 font-medium mb-1">Experiência relatada:</p><p className="text-sm text-gray-600">{experience}</p></div>
            )}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-purple-900 font-medium">Análise IA Personalizada:</p>
                {!generatedFeedback && !isGenerating && (
                  <button onClick={handleGenerateFeedback} className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700"><Sparkles className="h-3 w-3" /><span>Gerar</span></button>
                )}
              </div>
              {isGenerating && (<div className="flex items-center space-x-2 text-purple-600"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-4 w-4 border-2 border-purple-200 border-t-purple-600 rounded-full" /><span className="text-sm">Gerando...</span></div>)}
              {generatedFeedback && (<div className="bg-white/70 rounded-lg p-3"><div className="text-sm text-purple-800" dangerouslySetInnerHTML={{ __html: generatedFeedback.replace(/\n/g, '<br />') }} /></div>)}
              {!generatedFeedback && !isGenerating && (<p className="text-sm text-purple-600 italic">Clique em "Gerar" para uma análise personalizada</p>)}
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500 pt-1">
              {rating !== undefined && (<div className="flex items-center space-x-1"><Star className="h-3 w-3" /><span>Nota: {rating}/10</span></div>)}
              {engagement !== undefined && (<div className="flex items-center space-x-1"><Users className="h-3 w-3" /><span>Engajamento: {engagement}/10</span></div>)}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{new Date(timestamp).toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </motion.div>
  );
};