// src/components/FeedbackModal.tsx

import { analyzeFeedback } from '../utils/analytics';
import { MentorshipData, FeedbackItem } from '../types';
import { FeedbackCard } from './FeedbackCard';

interface FeedbackModalProps {
  feedbackData: MentorshipData[];
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ feedbackData, onClose }) => {
  const allFeedback = useMemo(() => analyzeFeedback(feedbackData), [feedbackData]);

  const handleGenerateFeedback = async (participant: MentorshipData) => {
    const email = participant['Endereço de e-mail'];
    setGeneratingFeedback(email);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const feedback = generateIndividualFeedback(participant);
    setGeneratedFeedbacks(prev => ({ ...prev, [email]: feedback }));
    setGeneratingFeedback(null);
  };

  const sentimentConfig = {
    positive: { color: 'bg-green-100 text-green-800', icon: CheckCircle, border: 'border-green-200', label: 'Positivo' },
    neutral: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, border: 'border-yellow-200', label: 'Neutro' },
    negative: { color: 'bg-red-100 text-red-800', icon: AlertCircle, border: 'border-red-200', label: 'Negativo' }
  };
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100/50 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Brain className="h-6 w-6 text-blue-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Todos os Feedbacks</h2>
              <p className="text-sm text-gray-600">{allFeedback.length} comentários encontrados</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 bg-gray-50/50">
          <div className="space-y-4">
            {allFeedback.length > 0 ? (
              allFeedback.map((item, index) => <FeedbackCard key={`${item.email}-${index}`} {...item} index={index} />)
            ) : (
              <div className="text-center py-10"><p className="text-gray-500">Nenhum feedback corresponde aos filtros selecionados.</p></div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};