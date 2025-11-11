import api from '../api/axios';
import { ChamadoProp, ApiResponse } from '../types';

export const chamadoService = {
  listarChamados: async (): Promise<ApiResponse<ChamadoProp[]>> => {
    try {
      const response = await api.get('/chamados');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  criarChamado: async (chamado: ChamadoProp): Promise<ApiResponse<ChamadoProp>> => {
    try {
      const response = await api.post('/chamados', chamado);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  atualizarChamado: async (id: number, chamado: Partial<ChamadoProp>): Promise<ApiResponse<ChamadoProp>> => {
    try {
      const response = await api.put(`/chamados/${id}`, chamado);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  obterChamado: async (id: number): Promise<ApiResponse<ChamadoProp>> => {
    try {
      const response = await api.get(`/chamados/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};