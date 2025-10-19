import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, useAuth } from './AuthContext';

// Definição dos tipos
interface Chamado {
  solicitante?: User; // Objeto do usuário para conveniência no frontend
  // Dados para o BD
  chamadoId?: number;
  atendenteId?: number;
  solicitanteId?: number;
  tituloChamado?: string;
  descricaoChamado?: string;
  categoriaChamado?: string | null;
  afetadosChamado?: 'eu' | 'setor' | 'empresa';
  prioridadeChamado?: 'baixa' | 'media' | 'alta' | 'urgente' | null;
  anexoChamado?: any | null;
  statusChamado?: 'aberto' | 'em_atendimento' | 'pendente' | 'resolvido' | 'fechado';
  dataAbertura?: Date | string;
  dataUltimaModificacao?: Date | string;
  solucaoSugerida?: string;
  solucaoAplicada?: string;
}

// Definição do contexto
interface ChamadoContextData {
  chamado: Chamado;
  setChamado: React.Dispatch<React.SetStateAction<Chamado>>;
  resetChamado: () => void;
}

// Estado inicial para um chamado "vazio"
const initialChamadoState: Chamado = {
  tituloChamado: '',
  descricaoChamado: '',
  categoriaChamado: null,
  prioridadeChamado: null,
  anexoChamado: null,
  statusChamado: 'aberto',
};

// Criação do Contexto
const ChamadoContext = createContext<ChamadoContextData | undefined>(undefined);

// Provider Component
export const ChamadoProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth(); // Obter o usuário logado do AuthContext
  const [chamado, setChamado] = useState<Chamado>(initialChamadoState);

  const resetChamado = () => {
    // A função reset volta para o estado inicial limpo
    setChamado(initialChamadoState);
  };

  // O valor do contexto que será fornecido aos componentes filhos
  const value = {
    chamado: {
      ...chamado,
      solicitante: user || undefined,
      solicitanteId: user?.id ? Number(user.id) : undefined, // Garante que user.id existe e faz a conversão segura
    },
    setChamado,
    resetChamado,
  };

  return (
    <ChamadoContext.Provider value={value}>
      {children}
    </ChamadoContext.Provider>
  );
};

// Custom Hook para usar o contexto
export const useChamado = () => {
  const context = useContext(ChamadoContext);
  if (context === undefined) {
    throw new Error('useChamado must be used within a ChamadoProvider');
  }
  return context;
};