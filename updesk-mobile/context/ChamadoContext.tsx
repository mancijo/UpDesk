import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, useAuth } from './AuthContext';

// Definição dos tipos
interface Chamado {
  chamado_ID?: number;
  atendenteID?: number;
  solicitanteID?: number;
  titulo_Chamado: string;
  descricao_Chamado: string;
  categoria_Chamado: string | null; // Permitir null inicialmente
  prioridade_Chamado: 'baixa' | 'media' | 'alta' | 'urgente' | null; // Permitir null inicialmente
  anexo_Chamado?: any | null; // O tipo 'any' pode ser refinado para um tipo de arquivo específico
  status_Chamado?: 'aberto' | 'em_atendimento' | 'pendente' | 'resolvido' | 'fechado';
  dataAbertura?: string | Date;
  dataUltimaModificacao?: string | Date;
  solucaoSugerida?: string;
  solucaoAplicada?: string;

  // Campo auxiliar para o objeto de usuário, não vai para o DB diretamente
  solicitante?: User;
}

interface ChamadoContextData {
  chamado: Chamado;
  setChamado: React.Dispatch<React.SetStateAction<Chamado>>;
  resetChamado: () => void;
}

// Estado inicial para o chamado
const initialChamadoState: Chamado = {
  titulo_Chamado: '',
  descricao_Chamado: '',
  categoria_Chamado: null, // Inicia como nulo
  prioridade_Chamado: null, // Inicia como nulo
  anexo_Chamado: null,
  status_Chamado: 'aberto',
};

// Criação do Contexto
const ChamadoContext = createContext<ChamadoContextData | undefined>(undefined);

// Provider Component
export const ChamadoProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth(); // Obter o usuário logado do AuthContext
  const [chamado, setChamado] = useState<Chamado>(initialChamadoState);

  const resetChamado = () => {
    // Ao resetar, limpamos o chamado e associamos o usuário logado para um novo preenchimento
    setChamado({ ...initialChamadoState, solicitante: user ?? undefined, solicitanteID: user ? Number(user.id) : undefined });
  };

  // O valor do contexto que será fornecido aos componentes filhos
  const value = {
    chamado: { ...chamado, solicitante: chamado.solicitante ?? user ?? undefined, solicitanteID: chamado.solicitanteID ?? (user ? Number(user.id) : undefined) }, // Garante que o usuário e seu ID estejam sempre no objeto chamado
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