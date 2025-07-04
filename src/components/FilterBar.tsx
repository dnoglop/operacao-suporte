import React from 'react';
import { Search } from 'lucide-react';

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  programFilter: string;
  setProgramFilter: (program: string) => void;
  roles: string[];
  programs: string[];
  startDate: Date | null;
  setStartDate: (date: Date | null) => void;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  programFilter,
  setProgramFilter,
  roles,
  programs,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  // Função para formatar data para o input type="date" (formato ISO: YYYY-MM-DD)
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    
    try {
      // Garante que estamos usando o timezone local
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '';
    }
  };

  // Função para formatar data para exibição (formato brasileiro: DD/MM/YYYY)
  const formatDateForDisplay = (date: Date | null): string => {
    if (!date) return '';
    
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Erro ao formatar data para exibição:', error);
      return '';
    }
  };

  // Função para criar data a partir do input
  const createDateFromInput = (inputValue: string): Date | null => {
    if (!inputValue) return null;
    
    try {
      const [year, month, day] = inputValue.split('-').map(Number);
      
      // Validação básica
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        console.error('Valores de data inválidos:', { year, month, day });
        return null;
      }
      
      // Cria a data no timezone local
      const date = new Date(year, month - 1, day);
      
      // Verifica se a data é válida
      if (isNaN(date.getTime())) {
        console.error('Data inválida criada:', date);
        return null;
      }
      
      return date;
    } catch (error) {
      console.error('Erro ao criar data:', error);
      return null;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8 border border-gray-100/50">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtrar Dados</h3>
      
      {/* Grid responsivo melhorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Campo de busca - ocupa 2 colunas em telas maiores */}
        <div className="relative lg:col-span-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Filtro de papel */}
        <div>
          <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Papel:
          </label>
          <select
            id="roleFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="all">Todos os papéis</option>
            {roles.filter(role => role && role.trim() !== '').map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de programa */}
        <div>
          <label htmlFor="programFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Programa:
          </label>
          <select
            id="programFilter"
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="all">Todos os programas</option>
            {programs.filter(program => program && program.trim() !== '').map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
        </div>

        {/* Data de início */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Data Início:
          </label>
          <input
            type="date"
            id="startDate"
            value={formatDateForInput(startDate)}
            onChange={(e) => {
              const date = createDateFromInput(e.target.value);
              if (date) {
                // Define o horário para o início do dia
                date.setHours(0, 0, 0, 0);
              }
              setStartDate(date);
            }}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Data de fim */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            Data Fim:
          </label>
          <input
            type="date"
            id="endDate"
            value={formatDateForInput(endDate)}
            onChange={(e) => {
              const date = createDateFromInput(e.target.value);
              if (date) {
                // Define o horário para o final do dia
                date.setHours(23, 59, 59, 999);
              }
              setEndDate(date);
            }}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Botão de limpar filtros */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('all');
              setProgramFilter('all');
              setStartDate(null);
              setEndDate(null);
            }}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Indicador de filtros ativos */}
      {(searchTerm || roleFilter !== 'all' || programFilter !== 'all' || startDate || endDate) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Filtros ativos: {
              [
                searchTerm && `Busca: "${searchTerm}"`,
                roleFilter !== 'all' && `Papel: ${roleFilter}`,
                programFilter !== 'all' && `Programa: ${programFilter}`,
                startDate && `Data início: ${formatDateForDisplay(startDate)}`,
                endDate && `Data fim: ${formatDateForDisplay(endDate)}`
              ].filter(Boolean).join(', ')
            }
          </p>
        </div>
      )}
    </div>
  );
};