import React, { createContext, useState, useContext, ReactNode } from 'react';

// Definição dos tipos
interface Usuario {
  id: number;
  nome: string;
  setor: string;
}

interface Chamado {
  titulo: string;
  descricao: string;
  afetados: 'eu' | 'setor' | 'empresa';
  anexo: any | null;
  solucaoIA: string;
}

interface ChamadoContextData {
  usuario: Usuario | null;
  chamado: Chamado;
  setChamado: React.Dispatch<React.SetStateAction<Chamado>>;
  resetChamado: () => void;
}

// Estado inicial para o chamado
const initialChamadoState: Chamado = {
  titulo: '',
  descricao: '',
  afetados: 'eu',
  anexo: null,
  solucaoIA: '',
};

// Criação do Contexto
const ChamadoContext = createContext<ChamadoContextData | undefined>(undefined);

// Provider Component
export const ChamadoProvider = ({ children }: { children: ReactNode }) => {
  // Placeholder para o usuário. Em um app real, isso viria do login.
  const [usuario] = useState<Usuario | null>({
    id: 123,
    nome: 'João da Silva',
    setor: 'TI',
  });

  const [chamado, setChamado] = useState<Chamado>(initialChamadoState);

  const resetChamado = () => {
    setChamado(initialChamadoState);
  };

  return (
    <ChamadoContext.Provider value={{ usuario, chamado, setChamado, resetChamado }}>
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