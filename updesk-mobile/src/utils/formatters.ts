export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    aberto: 'Aberto',
    em_atendimento: 'Em Atendimento',
    pendente: 'Pendente',
    resolvido: 'Resolvido',
    fechado: 'Fechado',
  };
  return statusMap[status] || status;
};

export const formatPrioridade = (prioridade: string): string => {
  const prioridadeMap: { [key: string]: string } = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    urgente: 'Urgente',
  };
  return prioridadeMap[prioridade] || prioridade;
};

export const getStatusColor = (status: string): string => {
  const statusColorMap: { [key: string]: string } = {
    aberto: '#FF9500', // warning
    em_atendimento: '#007AFF', // primary
    pendente: '#FF3B30', // danger
    resolvido: '#34C759', // success
    fechado: '#8E8E93', // gray
  };
  return statusColorMap[status] || '#8E8E93';
};