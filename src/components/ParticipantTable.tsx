import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Eye, CheckCircle, XCircle } from 'lucide-react';
import { MentorshipData } from '../types';

interface ParticipantTableProps {
  data: MentorshipData[];
}

export const ParticipantTable: React.FC<ParticipantTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');

  const filteredData = data.filter(participant => {
    const matchesSearch = participant['Nome completo'].toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant['Endereço de e-mail'].toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || participant['Você é?'] === roleFilter;
    const matchesProgram = programFilter === 'all' || participant['Qual o programa que está participando?'] === programFilter;
    
    return matchesSearch && matchesRole && matchesProgram;
  });

  const programs = [...new Set(data.map(d => d['Qual o programa que está participando?']))];

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar participante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os papéis</option>
          <option value="Mentor(a)">Mentor(a)</option>
          <option value="Mentorado(a)">Mentorado(a)</option>
        </select>

        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os programas</option>
          {programs.map(program => (
            <option key={program} value={program}>{program}</option>
          ))}
        </select>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>{filteredData.length} resultados</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Nome</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Papel</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Programa</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Encontros</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Nota Média</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((participant, index) => (
              <motion.tr
                key={participant['Endereço de e-mail']}
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
                  {participant['1.2 Qual encontro foi realizado?']}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-900">
                      {participant['1.4 De 0 a 10 qual a nota que você dá para o encontro?']}/10
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-1">
                    {participant['Validação'] === 'TRUE' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${
                      participant['Validação'] === 'TRUE' 
                        ? 'text-green-800' 
                        : 'text-red-800'
                    }`}>
                      {participant['Validação'] === 'TRUE' ? 'Validado' : 'Pendente'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};