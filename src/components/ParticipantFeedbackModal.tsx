import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Star, Users, Sparkles, MessageSquare } from 'lucide-react';
import { MentorshipData } from '../types';
import { generateIndividualFeedback, getSentiment } from '../utils/analytics';

interface ParticipantFeedbackModalProps {
  participantFeedbacks: MentorshipData[];
  onClose: () => void;
}

export const ParticipantFeedbackModal: React.FC<ParticipantFeedbackModalProps> = ({
  participantFeedbacks,
  onClose,
}) => {
  const [generatingFeedback, setGeneratingFeedback] = useState<string | null>(null);
  const [generatedFeedbacks, setGeneratedFeedbacks] = useState<Record<string, string>>({});

  const allFeedbackItems = useMemo(() => {
    return participantFeedbacks.filter(f => f['1.5 Como foi a sua experiência no último encontro?'] && f['1.5 Como foi a sua experiência no último encontro?'].trim() !== '');
  }, [participantFeedbacks]);

  const averageRating = useMemo(() => {
    const validRatings = allFeedbackItems.filter(f => f.rating > 0);
    if (validRatings.length === 0) return 'N/A';
    const sum = validRatings.reduce((acc, f) => acc + f.rating, 0);
    return (sum / validRatings.length).toFixed(1);
  }, [allFeedbackItems]);

  const averageEngagement = useMemo(() => {
    const validEngagements = allFeedbackItems.filter(f => f.engagement > 0);
    if (validEngagements.length === 0) return 'N/A';
    const sum = validEngagements.reduce((acc, f) => acc + f.engagement, 0);
    return (sum / validEngagements.length).toFixed(1);
  }, [allFeedbackItems]);

  const handleGenerateFeedback = async (feedbackItem: MentorshipData) => {
    const key = `${feedbackItem['Carimbo de data/hora']}-${feedbackItem['1.5 Como foi a sua experiência no último encontro?']}`;
    setGeneratingFeedback(key);
    try {
      const aiResponse = await generateIndividualFeedback(feedbackItem);
      setGeneratedFeedbacks(prev => ({ ...prev, [key]: aiResponse }));
    } catch (error) {
      console.error("Erro ao gerar feedback individual:", error);
      setGeneratedFeedbacks(prev => ({ ...prev, [key]: "Erro ao gerar análise. Tente novamente." }));
    } finally {
      setGeneratingFeedback(null);
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
        className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100/50 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Brain className="h-6 w-6 text-blue-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Feedback de {participantFeedbacks[0]['Nome completo']}</h2>
              <p className="text-sm text-gray-600">{participantFeedbacks[0]['Endereço de e-mail']}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 bg-gray-50/50">
          <div className="space-y-4">
            {allFeedbackItems.length > 0 ? (
              allFeedbackItems.map((feedback, index) => (
                <div key={index} className="bg-white/70 rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-700">Comentário {index + 1} ({new Date(feedback['Carimbo de data/hora']).toLocaleDateString()})</p>
                  </div>
                  <p className="text-sm text-gray-800 mb-3">{feedback['1.5 Como foi a sua experiência no último encontro?']}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    {feedback['1.4 De 0 a 10 qual a nota que você dá para o encontro?'] > 0 && (<div className="flex items-center space-x-1"><Star className="h-3 w-3" /><span>Nota: {feedback['1.4 De 0 a 10 qual a nota que você dá para o encontro?']}/10</span></div>)}
                    {feedback['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?'] > 0 && (<div className="flex items-center space-x-1"><Users className="h-3 w-3" /><span>Engajamento: {feedback['1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?']}/10</span></div>)}
                  </div>
                  
                  {feedback.aiFeedback && feedback.aiFeedback.trim() !== '.' && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-blue-900 font-medium mb-1">Feedback IA Existente:</p>
                      <p className="text-sm text-blue-800">{feedback.aiFeedback}</p>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-purple-900 font-medium">Análise IA Personalizada:</p>
                      {!generatedFeedbacks[`${feedback['Carimbo de data/hora']}-${feedback['1.5 Como foi a sua experiência no último encontro?']}`] && !generatingFeedback && (
                        <button
                          onClick={() => handleGenerateFeedback(feedback)}
                          className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700"
                        >
                          <Sparkles className="h-3 w-3" /><span>Gerar</span>
                        </button>
                      )}
                    </div>
                    {generatingFeedback === `${feedback.timestamp}-${feedback.experience}` && (
                      <div className="flex items-center space-x-2 text-purple-600">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-4 w-4 border-2 border-purple-200 border-t-purple-600 rounded-full" />
                        <span className="text-sm">Gerando...</span>
                      </div>
                    )}
                    {generatedFeedbacks[`${feedback['Carimbo de data/hora']}-${feedback['1.5 Como foi a sua experiência no último encontro?']}`] && (
                      <div className="bg-white/70 rounded-lg p-3">
                        <p className="text-sm text-purple-800">{generatedFeedbacks[`${feedback['Carimbo de data/hora']}-${feedback['1.5 Como foi a sua experiência no último encontro?']}`]}</p>
                      </div>
                    )}
                    {!generatedFeedbacks[`${feedback['Carimbo de data/hora']}-${feedback['1.5 Como foi a sua experiência no último encontro?']}`] && !generatingFeedback && (
                      <p className="text-sm text-purple-600 italic">Clique em "Gerar" para uma análise personalizada</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10"><p className="text-gray-500">Nenhum feedback detalhado encontrado para este participante.</p></div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
