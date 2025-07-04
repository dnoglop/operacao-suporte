// src/components/FeedbackModal.tsx

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, AlertCircle, CheckCircle, Clock, Star, Users, Sparkles, Search } from 'lucide-react';
import { analyzeFeedback } from '../utils/analytics';
import { MentorshipData, FeedbackItem } from '../types';
import { FeedbackCard } from './FeedbackCard';

interface FeedbackModalProps {
  feedbackData: MentorshipData[];
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ feedbackData, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');

  const allFeedback = useMemo(() => analyzeFeedback(feedbackData), [feedbackData]);

  const roles = useMemo(() => 
    [...new Set(allFeedback.map(f => f['Você é?']?.trim()).filter(Boolean))].sort(), 
    [allFeedback]
  );

  const programs = useMemo(() => 
    [...new Set(allFeedback.map(f => f['Qual o programa que está participando?']?.trim()).filter(Boolean))].sort(),
    [allFeedback]
  );

  const filteredFeedback = useMemo(() => {
    return allFeedback.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' ||
        item.participant?.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower);

      const matchesRole = roleFilter === 'all' || (item['Você é?']?.trim() ?? '') === roleFilter;
      const matchesProgram = programFilter === 'all' || (item['Qual o programa que está participando?']?.trim() ?? '') === programFilter;

      return matchesSearch && matchesRole && matchesProgram;
    });
  }, [allFeedback, searchTerm, roleFilter, programFilter]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100/50 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Brain className="h-6 w-6 text-blue-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Todos os Feedbacks</h2>
              <p className="text-sm text-gray-600">{filteredFeedback.length} comentários encontrados</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="all">Todos os papéis</option>
              {roles.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
            <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="all">Todos os programas</option>
              {programs.map(program => <option key={program} value={program}>{program}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-6 bg-gray-50/50">
          <div className="space-y-4">
            {filteredFeedback.length > 0 ? (
              filteredFeedback.map((item, index) => <FeedbackCard key={`${item.email}-${index}`} {...item} index={index} />)
            ) : (
              <div className="text-center py-10"><p className="text-gray-500">Nenhum feedback corresponde aos filtros selecionados.</p></div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};