import api from '../src/api/axios';
import { chamadoService } from '../src/services/chamadoService';
import { ChamadoProp } from '../src/types';

jest.mock('../src/api/axios', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

const mockedApi = api as unknown as { post: jest.Mock };

describe('chamadoService.criarChamado', () => {
  beforeEach(() => {
    mockedApi.post.mockReset();
  });

  test('envia o chamado para a API e retorna os dados recebidos', async () => {
    const chamado: ChamadoProp = { tituloChamado: 'Teste', descricaoChamado: 'Descrição' };
    const apiResponse = { data: { data: { ...chamado, chamadoId: 123 }, status: 201 } };
    mockedApi.post.mockResolvedValue(apiResponse);

    const result = await chamadoService.criarChamado(chamado);

    expect(mockedApi.post).toHaveBeenCalledWith('/chamados', chamado);
    expect(result).toEqual(apiResponse.data);
  });

  test('propaga erros quando a requisição falha', async () => {
    const chamado: ChamadoProp = { tituloChamado: 'Erro', descricaoChamado: 'Falha' };
    mockedApi.post.mockRejectedValue(new Error('Network error'));

    await expect(chamadoService.criarChamado(chamado)).rejects.toThrow('Network error');
    expect(mockedApi.post).toHaveBeenCalledWith('/chamados', chamado);
  });

  test('envia o payload exatamente como recebido', async () => {
    const chamado: ChamadoProp = {
      tituloChamado: 'Payload Test',
      descricaoChamado: 'Verifica payload',
      prioridadeChamado: 'alta',
    };
    const apiResponse = { data: { data: { ...chamado, chamadoId: 555 }, status: 201 } };
    mockedApi.post.mockResolvedValue(apiResponse);

    await chamadoService.criarChamado(chamado);

    expect(mockedApi.post.mock.calls[0][1]).toEqual(chamado);
  });
});
