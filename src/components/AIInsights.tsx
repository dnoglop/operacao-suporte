import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Star, 
  AlertCircle, 
  Users, 
  UserX, 
  CheckCircle, 
  Clock 
} from 'lucide-react';

interface AIInsight {
  type: 'positive' | 'negative' | 'warning' | 'neutral';
  title: string;
  description: string;
  icon: string;
}

interface AIInsightsProps {
  insights: AIInsight[];
  setTriggerAIAnalysis: (trigger: boolean) => void;
}

const iconMap = {
  'trending-up': TrendingUp,
  'alert-triangle': AlertTriangle,
  'star': Star,
  'alert-circle': AlertCircle,
  'users': Users,
  'user-x': UserX,
  'check-circle': CheckCircle,
  'clock': Clock,
};

export const AIInsights: React.FC<AIInsightsProps> = ({ insights, setTriggerAIAnalysis }) => {
  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'positive':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          title: 'text-green-900',
          description: 'text-green-700'
        };
      case 'negative':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          title: 'text-red-900',
          description: 'text-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-900',
          description: 'text-yellow-700'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          description: 'text-blue-700'
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100/50"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Insights da IA</h2>
          <p className="text-sm text-gray-600">Análise automática dos dados de mentoria</p>
        </div>
        <button
          onClick={() => setTriggerAIAnalysis(true)}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
        >
          Gerar Análise da IA
        </button>
      </div>

      {insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const style = getInsightStyle(insight.type);
            const IconComponent = iconMap[insight.icon as keyof typeof iconMap] || Brain;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${style.bg} ${style.border} border rounded-xl p-4`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-white/50`}>
                    <IconComponent className={`h-5 w-5 ${style.icon}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${style.title} mb-1`}>
                      {insight.title}
                    </h3>
                    <p className={`text-sm ${style.description}`}>
                      {insight.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Clique em 'Gerar Análise da IA' para obter insights.
          </p>
        </div>
      )}
    </motion.div>
  );
};