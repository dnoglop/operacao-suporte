import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { MentorshipData } from '../types';

interface FileUploadProps {
  onDataUpload: (data: MentorshipData[]) => void;
  onClose: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataUpload, onClose }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState('');

  const keyMap: { [key: string]: keyof MentorshipData } = {
  'carimbo de data/hora': 'Carimbo de data/hora',
  'timestamp': 'Carimbo de data/hora',
  'endereço de e-mail': 'Endereço de e-mail',
  'email': 'Endereço de e-mail',
  'e-mail': 'Endereço de e-mail',
  'nome completo': 'Nome completo',
  'full name': 'Nome completo',
  'name': 'Nome completo',
  'telefone com ddd': 'Telefone com DDD',
  'phone': 'Telefone com DDD',
  'você é?': 'Você é?',
  'role': 'Você é?',
  'papel': 'Você é?',
  'qual o programa que está participando?': 'Qual o programa que está participando?',
  'programa': 'Qual o programa que está participando?',
  'program': 'Qual o programa que está participando?',
  'quantos encontros já foram realizados?': 'Quantos encontros já foram realizados?',
  '1.2 qual encontro foi realizado?': '1.2 Qual encontro foi realizado?',
  '1.3 quantos minutos durou o encontro?': '1.3 Quantos minutos durou o encontro?',
  '1.4 de 0 a 10 qual a nota que você dá para o encontro?': '1.4 De 0 a 10 qual a nota que você dá para o encontro?',
  '1.5 como foi a sua experiência no último encontro?': '1.5 Como foi a sua experiência no último encontro?',
  '1.6 de 0 a 10 qual a nota que você dá para o engajamento da sua dupla?': '1.6 De 0 a 10 qual a nota que você dá para o engajamento da sua dupla?',
  '1.7 você tem alguma dúvida, comentário ou sugestão?': '1.7 Você tem alguma dúvida, comentário ou sugestão?',
  'comentários joule': 'Comentários Joule',
  'feedback ai': 'Feedback AI',
  'validação': 'Validação',
  'validation': 'Validação',
};

const normalizeObjectKeys = (obj: Record<string, any>): Partial<MentorshipData> => {
  const newObj: Record<string, any> = {};
  for (const key in obj) {
    const normalizedKey = key.toLowerCase().trim();
    const newKey = keyMap[normalizedKey] || key; 
    newObj[newKey] = obj[key];
  }
  return newObj as Partial<MentorshipData>;
};

const validateJsonData = (data: any[]): boolean => {
    if (!Array.isArray(data)) return false;
    
    const requiredFields = [
      'Carimbo de data/hora',
      'Endereço de e-mail',
      'Nome completo',
      'Você é?',
      'Qual o programa que está participando?'
    ];

    return data.every(item => 
      requiredFields.every(field => field in item)
    );
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setErrorMessage('Por favor, selecione um arquivo JSON válido.');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setFileName(file.name);

    try {
      const text = await file.text();
      let jsonData = JSON.parse(text);

      if (Array.isArray(jsonData)) {
        jsonData = jsonData.map(normalizeObjectKeys);
      }
      
      if (!validateJsonData(jsonData)) {
        throw new Error('Formato de dados inválido. Verifique se o arquivo contém os campos obrigatórios.');
      }

      setUploadStatus('success');
      setTimeout(() => {
        onDataUpload(jsonData);
        onClose();
      }, 1500);

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao processar o arquivo.');
      setUploadStatus('error');
    }
  }, [onDataUpload, onClose]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const resetUpload = () => {
    setUploadStatus('idle');
    setErrorMessage('');
    setFileName('');
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
        className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-100/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upload de Dados</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {uploadStatus === 'idle' && (
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <Upload className={`h-12 w-12 mx-auto mb-4 ${
              isDragOver ? 'text-blue-500' : 'text-gray-400'
            }`} />
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Arraste seu arquivo JSON aqui
            </h3>
            <p className="text-gray-600 mb-4">
              ou clique para selecionar um arquivo
            </p>
            
            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <FileText className="h-4 w-4 mr-2" />
              Selecionar Arquivo
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            
            <div className="mt-4 text-xs text-gray-500">
              <p>Formato aceito: JSON</p>
              <p>Tamanho máximo: 10MB</p>
            </div>
          </div>
        )}

        {uploadStatus === 'uploading' && (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Processando arquivo...
            </h3>
            <p className="text-gray-600">{fileName}</p>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload realizado com sucesso!
            </h3>
            <p className="text-gray-600">
              Os dados foram carregados e o dashboard será atualizado.
            </p>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erro no upload
            </h3>
            <p className="text-red-600 mb-4">{errorMessage}</p>
            <button
              onClick={resetUpload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Formato esperado:</h4>
          <p className="text-sm text-blue-800">
            O arquivo JSON deve conter um array de objetos com os campos obrigatórios: 
            Carimbo de data/hora, Endereço de e-mail, Nome completo, Você é?, 
            Qual o programa que está participando?
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};