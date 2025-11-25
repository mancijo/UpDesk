export interface User {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  setor: string;
  cargo: string;
}

export interface ChamadoProp {
  solicitante?: User;
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

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}