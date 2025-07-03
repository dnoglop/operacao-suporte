import React from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface FeedbackCardProps {
  feedback: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  participant: string;
  timestamp: string;
  index: number;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ 
  feedback, 
  sentiment, 
  participant, 
  timestamp,
  index 
}) => {
  const sentimentConfig = {
    positive: { 
      color: 'bg-green-100 text-green-800', 
      icon: CheckCircle,
      border: 'border-green-200'
    },
    neutral: { 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: Clock,
      border: 'border-yellow-200'
    },
    negative: { 
      color: 'bg-red-100 text-red-800', 
      icon: AlertCircle,
      border: 'border-red-200'
    }
  };

  const config = sentimentConfig[sentiment];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border ${config.border}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-900">{participant}</p>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
              <IconComponent className="h-3 w-3" />
              <span className="capitalize">{sentiment}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-700 mb-2">{feedback}</p>
          
          <p className="text-xs text-gray-500">
            {new Date(timestamp).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </motion.div>
  );
};