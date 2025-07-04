// src/components/ParticipantTable.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Eye, CheckCircle, XCircle } from 'lucide-react';
import { MentorshipData } from '../types';
import { ParticipantFeedbackModal } from './ParticipantFeedbackModal';

interface ParticipantTableProps {
  data: MentorshipData[];
  setShowParticipantFeedbackModal: (show: boolean) => void;
  setSelectedParticipant: (email: string | null) => void;
}

export const ParticipantTable: React.FC<ParticipantTableProps> = ({ data, setShowParticipantFeedbackModal, setSelectedParticipant }) => {
  const renderNote = (note: number | string | undefined) => {
    if (note === '' || note === undefined || note === null) {
      return 'N/A';
    }
    return `${note}/10`;
  };

  const handleViewFeedback = (participant: MentorshipData) => {
    setSelectedParticipant(participant['Endereço de e-mail']);
    setShowParticipantFeedbackModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Participantes</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="h-4 w-4" />
          <span>Exportar</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Nome</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Papel</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Programa</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Encontro Nº</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Nota Média</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((participant, index) => (
                <motion.tr
                  key={`${participant['Endereço de e-mail']}-${participant['Carimbo de data/hora']}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{participant['Nome completo']}</p>
                      <p className="text-sm text-gray-500">{participant['Endereço de e-mail']}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      participant['Você é?'] === 'Mentor(a)'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {participant['Você é?']}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 max-w-48 truncate">
                    {participant['Qual o programa que está participando?']}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {participant['1.2 Qual encontro foi realizado?'] || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-900">
                        {renderNote(participant['1.4 De 0 a 10 qual a nota que você dá para o encontro?'])}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      {participant['Validação'] === 'TRUE' || 'VERDADEIRO' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-xs font-medium ${
                        participant['Validação'] === 'TRUE' || 'VERDADEIRO'
                          ? 'text-green-800'
                          : 'text-red-800'
                      }`}>
                        {participant['Validação'] === 'TRUE'||'VERDADEIRO' ? 'Validado' : 'Pendente'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleViewFeedback(participant)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhum participante encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
    </motion.div>
  );
};