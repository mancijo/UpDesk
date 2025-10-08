
using System.ComponentModel.DataAnnotations;

namespace UpDesk.Api.Dtos;

// DTO para listar chamados (versão resumida)
public record ChamadoSummaryDto(
    int Id,
    string Titulo,
    string Categoria,
    string Prioridade,
    string Status,
    DateTime DataAbertura,
    string? SolicitanteNome,
    string? AtendenteNome
);

// DTO para detalhes de um chamado
public record ChamadoDetailsDto(
    int Id,
    string Titulo,
    string Descricao,
    string Categoria,
    string Prioridade,
    string Status,
    DateTime DataAbertura,
    DateTime? DataUltimaModificacao,
    string? SolucaoSugerida,
    string? SolucaoAplicada,
    int? SolicitanteId,
    string? SolicitanteNome,
    int? AtendenteId,
    string? AtendenteNome,
    IEnumerable<MensagemDto> Mensagens
);

// DTO para criar um novo chamado
public record CreateChamadoDto(
    [Required] int SolicitanteId,
    [Required][StringLength(255)] string Titulo,
    [Required] string Descricao,
    [Required][StringLength(100)] string Categoria,
    [Required][StringLength(15)] string Prioridade
);

// DTO para transferir um chamado
public record TransferChamadoDto(
    [Required] int NovoAtendenteId
);

// DTO para atualizar o status de um chamado
public record UpdateChamadoStatusDto(
    [Required][StringLength(50)] string NovoStatus
);

// DTO para mensagens/interações
public record MensagemDto(
    int Id,
    int ChamadoId,
    int UsuarioId,
    string UsuarioNome,
    string Mensagem,
    DateTime DataCriacao
);

// DTO para criar uma nova mensagem
public record CreateMensagemDto(
    [Required] int UsuarioId,
    [Required] string Mensagem
);

// DTO para o endpoint de estatísticas
public record DashboardStatsDto(
    int TotalChamados,
    int ChamadosAbertos,
    int ChamadosEmAndamento,
    int ChamadosPendentes,
    int ChamadosResolvidos,
    int ChamadosFechados
);

// DTO para listar técnicos
public record TecnicoDto(
    int Id,
    string Nome
);

// DTO para sugestão de IA
public record SugestaoIaDto(
    [Required] string Titulo,
    [Required] string Descricao
);
