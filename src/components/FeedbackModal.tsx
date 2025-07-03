import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, AlertCircle, CheckCircle, Clock, Star, Users, Sparkles } from 'lucide-react';
import { generateIndividualFeedback } from '../utils/analytics';

interface FeedbackModalProps {
  feedbackData: any[];
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ feedbackData, onClose }) => {
  const [generatingFeedback, setGeneratingFeedback] = useState<string | null>(null);
  const [generatedFeedbacks, setGeneratedFeedbacks] = useState<Record<string, string>>({});

  const handleGenerateFeedback = async (participant: any) => {
    setGeneratingFeedback(participant.email);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const feedback = generateIndividualFeedback(participant);
    setGeneratedFeedbacks(prev => ({
      ...prev,
      [participant.email]: feedback
    }));
    setGeneratingFeedback(null);
  };

  const sentimentConfig = {
    positive: { 
      color: 'bg-green-100 text-green-800', 
      icon: CheckCircle,
      border: 'border-green-200',
      label: 'Positivo'
    },
    neutral: { 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: Clock,
      border: 'border-yellow-200',
      label: 'Neutro'
    },
    negative: { 
      color: 'bg-red-100 text-red-800', 
      icon: AlertCircle,
      border: 'border-red-200',
      label: 'Negativo'
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-gray-100/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Todos os Feedbacks</h2>
              <p className="text-sm text-gray-600">{feedbackData.length} comentários encontrados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-6">
          <div className="space-y-4">
            {feedbackData.map((feedback, index) => {
              const config = sentimentConfig[feedback.sentiment];
              const IconComponent = config.icon;
              const isGenerating = generatingFeedback === feedback.email;
              const hasGeneratedFeedback = generatedFeedbacks[feedback.email];

              return (
                <motion.div
                  key={`${feedback.email}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border ${config.border}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Brain className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{feedback.participant}</p>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          <IconComponent className="h-3 w-3" />
                          <span>{config.label}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {feedback.feedback && feedback.feedback !== '.' && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-sm text-blue-900 font-medium mb-1">Feedback existente:</p>
                            <p className="text-sm text-blue-800">{feedback.feedback}</p>
                          </div>
                        )}
                        
                        {feedback.experience && feedback.experience.trim() !== '' && feedback.experience !== 'Ainda não realizado' && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700 font-medium mb-1">Experiência relatada:</p>
                            <p className="text-sm text-gray-600">{feedback.experience}</p>
                          </div>
                        )}

                        {/* Generated AI Feedback Section */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-purple-900 font-medium">Análise IA Personalizada:</p>
                            {!hasGeneratedFeedback && !isGenerating && (
                              <button
                                onClick={() => handleGenerateFeedback(feedback)}
                                className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
                              >
                                <Sparkles className="h-3 w-3" />
                                <span>Gerar Feedback</span>
                              </button>
                            )}
                          </div>
                          
                          {isGenerating && (
                            <div className="flex items-center space-x-2 text-purple-600">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="h-4 w-4 border-2 border-purple-200 border-t-purple-600 rounded-full"
                              />
                              <span className="text-sm">Gerando análise personalizada...</span>
                            </div>
                          )}
                          
                          {hasGeneratedFeedback && (
                            <div className="bg-white/70 rounded-lg p-3">
                              <p className="text-sm text-purple-800">{hasGeneratedFeedback}</p>
                            </div>
                          )}
                          
                          {!hasGeneratedFeedback && !isGenerating && (
                            <p className="text-sm text-purple-600 italic">
                              Clique em "Gerar Feedback" para uma análise personalizada deste participante
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {feedback.rating !== undefined && feedback.rating > 0 && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3" />
                              <span>Nota: {feedback.rating}/10</span>
                            </div>
                          )}
                          {feedback.engagement !== undefined && feedback.engagement > 0 && (
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>Engajamento: {feedback.engagement}/10</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(feedback.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};