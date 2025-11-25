// c:\Users\Mateus Teodoro\upDesk\UpDesk.api\UpDesk.api.Web\Dtos\ChamadoDtos.cs
namespace UpDesk.Api.Dtos;

// DTO para a lista resumida de chamados
public record ChamadoSummaryDto(
    int ChamadoId,
    string TituloChamado,
    string CategoriaChamado,
    string PrioridadeChamado,
    string StatusChamado,
    DateTime DataAbertura,
    string? SolicitanteNome,
    string? AtendenteNome
);

// DTO para os detalhes completos de um chamado
public record ChamadoDetailsDto(
    int ChamadoId,
    string TituloChamado,
    string DescricaoChamado,
    string CategoriaChamado,
    string PrioridadeChamado,
    string StatusChamado,
    DateTime DataAbertura,
    DateTime? DataUltimaModificacao,
    string? SolucaoSugerida,
    string? SolucaoAplicada,
    int? SolicitanteId,
    string? SolicitanteNome,
    string? SolicitanteEmail,
    string? SolicitanteTelefone,
    int? AtendenteId,
    string? AtendenteNome,
    List<MensagemDto> Interacoes
);

// DTO para criar um novo chamado
public record CreateChamadoDto(
    int SolicitanteId,
    string Titulo,
    string Descricao,
    string Categoria,
    string Prioridade,
    string? Status,
    string? Solucao
);

// DTO para atualizar o status de um chamado
public record UpdateChamadoStatusDto(string NovoStatus);

// DTO para transferir um chamado
public record TransferChamadoDto(int NovoAtendenteId);

// DTO para criar uma nova mensagem/interação
public record CreateMensagemDto(int UsuarioId, string Mensagem);

// DTO para representar uma mensagem no chat
public record MensagemDto(
    int Id,
    int ChamadoId,
    int UsuarioId,
    string UsuarioNome,
    string Mensagem,
    DateTime DataCriacao
);

// DTO para resolver um chamado com a solução da IA
public record ResolverComIaDto(string Solucao);

// DTO para as estatísticas do dashboard
public record DashboardStatsDto(
    int TotalChamados,
    int ChamadosAbertos,
    int ChamadosEmAtendimento,
    int ChamadosFinalizados,
    int ChamadosSolucaoIA,
    int ChamadosEmTriagem
);

// DTO para solicitar uma sugestão da IA
public record SugestaoIaDto(
    string Titulo,
    string Descricao
);

// DTO para listar técnicos
public record TecnicoDto(
    int Id,
    string Nome
);
