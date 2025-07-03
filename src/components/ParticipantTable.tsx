// src/components/ParticipantTable.tsx

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Eye, CheckCircle, XCircle } from 'lucide-react';

// Defina o tipo dos seus dados para melhor autocompletar e segurança
// (ajustado com base no seu JSON)
interface MentorshipData {
  'Carimbo de data/hora': string;
  'Endereço de e-mail': string;
  'Nome completo': string;
  'Telefone com DDD': string | number;
  'Você é?': string;
  'Qual o programa que está participando?': string;
  'Quantos encontros já foram realizados?': string;
  '1.2 Qual encontro foi realizado?': number | string;
  '1.3 Quantos minutos durou o encontro?': number | string;
  '1.4 De 0 a 10 qual a nota que você dá para o encontro?': number | string;
  '1.5 Como foi a sua experiência no último encontro?': string;
  '1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?': number | string;
  '1.7 Você tem alguma dúvida, comentário ou sugestão?': string;
  'Comentários Joule': string;
  'Feedback AI': string;
  'Validação': 'TRUE' | 'FALSE' | string;
}


interface ParticipantTableProps {
  data: MentorshipData[];
}

export const ParticipantTable: React.FC<ParticipantTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');

  // Usar useMemo para extrair papéis e programas é uma ótima prática
  const roles = useMemo(() =>
    [...new Set(data.map(d => d['Você é?']?.trim()).filter(Boolean))].sort(),
    [data]
  );

  const programs = useMemo(() =>
    [...new Set(data.map(d => d['Qual o programa que está participando?']?.trim()).filter(Boolean))].sort(),
    [data]
  );

  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter(participant => {
      if (!participant) return false;

      const searchLower = searchTerm.toLowerCase();

      // Filtro de Busca
      const matchesSearch = searchTerm === '' ||
        (participant['Nome completo'] &&
         typeof participant['Nome completo'] === 'string' &&
         participant['Nome completo'].toLowerCase().includes(searchLower)) ||
        (participant['Endereço de e-mail'] &&
         typeof participant['Endereço de e-mail'] === 'string' &&
         participant['Endereço de e-mail'].toLowerCase().includes(searchLower));

      // Filtro de Papel
      const participantRole = participant['Você é?'] ? participant['Você é?'].trim() : '';
      const matchesRole = roleFilter === 'all' || participantRole === roleFilter;

      // Filtro de Programa
      const participantProgram = participant['Qual o programa que está participando?'] ?
        participant['Qual o programa que está participando?'].trim() : '';
      const matchesProgram = programFilter === 'all' || participantProgram === programFilter;

      return matchesSearch && matchesRole && matchesProgram;
    });
  }, [data, searchTerm, roleFilter, programFilter]);

  // Função para exibir a nota de forma segura
  const renderNote = (note: number | string | undefined) => {
    if (note === '' || note === undefined || note === null) {
      return 'N/A';
    }
    return `${note}/10`;
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
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
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
          {/* Este contador usa a lista filtrada, por isso o número está correto */}
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
              <th className="text-left py-3 px-4 font-medium text-gray-600">Encontro Nº</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Nota Média</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {/* AQUI É O PONTO CRÍTICO: CERTIFIQUE-SE DE USAR "filteredData.map" */}
            {filteredData.length > 0 ? (
              filteredData.map((participant, index) => (
                <motion.tr
                  // Chave única combinando email e timestamp para evitar problemas com dados duplicados
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