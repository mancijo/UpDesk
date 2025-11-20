using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UpDesk.Api.Data;
using UpDesk.Api.Dtos;
using UpDesk.Api.Models;
using UpDesk.Api.Services;
using Microsoft.Extensions.Logging;

namespace UpDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChamadosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    private readonly IaiService _iaService;
    private readonly ILogger<ChamadosController> _logger;

    public ChamadosController(ApplicationDbContext context, IaiService iaService, ILogger<ChamadosController> logger)
    {
        _context = context;
        _iaService = iaService;
        _logger = logger;
    }

    // GET: api/chamados
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ChamadoSummaryDto>>> GetChamados([FromQuery] string? status, [FromQuery] string? q, [FromQuery] int? solicitanteId)
    {
        var query = _context.Chamados
            .Include(c => c.Solicitante)
            .Include(c => c.Atendente)
            .AsQueryable();
        
        if (solicitanteId.HasValue)
        {
            query = query.Where(c => c.SolicitanteId == solicitanteId); // 👈 FILTRA AQUI
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(c => c.StatusChamado == status);
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            query = query.Where(c => c.TituloChamado.Contains(q) || c.DescricaoChamado.Contains(q));
        }

        // CORREÇÃO: OrderByDescending foi movido para ANTES do Select
        return await query
            .OrderByDescending(c => c.DataAbertura)
            .Select(c => new ChamadoSummaryDto( // Correção: Mapeamento explícito para garantir consistência
                c.ChamadoId, // ChamadoId
                c.TituloChamado, // TituloChamado
                c.CategoriaChamado, // CategoriaChamado
                c.PrioridadeChamado, // PrioridadeChamado
                c.StatusChamado, // StatusChamado
                c.DataAbertura, // DataAbertura
                c.Solicitante != null ? c.Solicitante.Nome : "N/A", // SolicitanteNome
                c.Atendente != null ? c.Atendente.Nome : "N/A" // AtendenteNome
            ))
            .ToListAsync();
    }

    // GET: api/chamados/triagem
    [HttpGet("triagem")]
    public async Task<ActionResult<IEnumerable<ChamadoSummaryDto>>> GetChamadosTriagem()
    {
        // Retorna chamados "Aberto" e sem atendente para a tela de triagem
        return await _context.Chamados
            .Include(c => c.Solicitante)
            .Where(c => c.StatusChamado == "Aberto" && c.AtendenteId == null)
            .OrderBy(c => c.DataAbertura) // CORREÇÃO: Mover o OrderBy para antes do Select
            .Select(c => new ChamadoSummaryDto( // Correção: Mapeamento explícito
                c.ChamadoId, // ChamadoId
                c.TituloChamado, // TituloChamado
                c.CategoriaChamado, // CategoriaChamado
                c.PrioridadeChamado, // PrioridadeChamado
                c.StatusChamado, // StatusChamado
                c.DataAbertura, // DataAbertura
                c.Solicitante != null ? c.Solicitante.Nome : "N/A", // SolicitanteNome
                null // Atendente é nulo na triagem
            ))
            .ToListAsync();
    }

    // GET: api/chamados/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ChamadoDetailsDto>> GetChamado(int id)
    {
        var chamado = await _context.Chamados
            .Include(c => c.Solicitante)
            .Include(c => c.Atendente)
            .Include(c => c.Interacoes)
                .ThenInclude(i => i.Usuario)
            .FirstOrDefaultAsync(c => c.ChamadoId == id);

        if (chamado == null)
        {
            return NotFound();
        }

        var chamadoDto = new ChamadoDetailsDto(
            chamado.ChamadoId,
            chamado.TituloChamado,
            chamado.DescricaoChamado,
            chamado.CategoriaChamado,
            chamado.PrioridadeChamado,
            chamado.StatusChamado,
            chamado.DataAbertura,
            chamado.DataUltimaModificacao,
            chamado.SolucaoSugerida,
            chamado.SolucaoAplicada,
            chamado.SolicitanteId,
            chamado.Solicitante?.Nome,
            chamado.Solicitante?.Email,
            chamado.Solicitante?.Telefone,
            chamado.AtendenteId,
            chamado.Atendente?.Nome,
            chamado.Interacoes.Select(i => new MensagemDto(
                i.Id,
                i.ChamadoId,
                i.UsuarioId,
                i.Usuario != null ? i.Usuario.Nome : "Usuário Desconhecido",
                i.Mensagem,
                i.DataCriacao
            )).OrderBy(m => m.DataCriacao).ToList()
        );

        return Ok(chamadoDto);
    }

    // POST: api/chamados
    [HttpPost]
    public async Task<ActionResult<ChamadoSummaryDto>> CreateChamado([FromBody] CreateChamadoDto chamadoDto)
    {
        var solicitante = await _context.Usuarios.FindAsync(chamadoDto.SolicitanteId);
        if (solicitante == null)
        {
            return BadRequest(new { message = "Solicitante inválido." });
        }

        var novoChamado = new Chamado
        {
            SolicitanteId = chamadoDto.SolicitanteId,
            TituloChamado = chamadoDto.Titulo,
            DescricaoChamado = chamadoDto.Descricao,
            CategoriaChamado = chamadoDto.Categoria ?? "Outros", // valor padrão caso front-end não envie; a IA pode sobrescrever
            PrioridadeChamado = chamadoDto.Prioridade,
            StatusChamado = "Aberto",
            DataAbertura = DateTime.UtcNow,
            DataUltimaModificacao = DateTime.UtcNow
        };

        // 🔹 Envia a descrição do problema para a IA Gemini
        try
        {
            // Primeiro, solicita classificação de categoria à IA (caso o campo tenha sido removido no front-end)
            try
            {
                var categoria = await _iaService.ClassifyCategoryAsync(chamadoDto.Titulo, chamadoDto.Descricao ?? string.Empty);
                if (!string.IsNullOrWhiteSpace(categoria))
                {
                    novoChamado.CategoriaChamado = categoria;
                    _logger.LogInformation("Categoria definida pela IA: {Categoria}", categoria);
                }
            }
            catch (Exception cex)
            {
                _logger.LogWarning(cex, "Falha ao classificar categoria com IA; mantendo categoria nula ou padrão.");
            }

            // Usa o serviço de IA via contrato IaiService (pode ser mock ou Gemini)
            var promptPreview = (chamadoDto.Titulo + " - " + (chamadoDto.Descricao ?? string.Empty)).Trim();
            if (promptPreview.Length > 400) promptPreview = promptPreview.Substring(0, 400) + "...";
            _logger.LogInformation("Enviando prompt para IA ao criar chamado: {Preview}", promptPreview);

            string respostaIa = await _iaService.BuscarSolucaoAsync(chamadoDto.Titulo, chamadoDto.Descricao ?? string.Empty);

            if (!string.IsNullOrWhiteSpace(respostaIa))
            {
                // Filtra respostas que são mensagens de erro provenientes do serviço para evitar salvar texto de erro como sugestão
                if (respostaIa.StartsWith("Erro", StringComparison.OrdinalIgnoreCase) || respostaIa.Contains("Tempo esgotado") || respostaIa.Contains("formato inesperado"))
                {
                    _logger.LogWarning("Resposta da IA indica erro ou formato inesperado. Não salvando como solução. Resposta (trunc): {Resp}", respostaIa.Length > 500 ? respostaIa.Substring(0, 500) + "..." : respostaIa);
                }
                else
                {
                    novoChamado.SolucaoSugerida = respostaIa;
                    _logger.LogInformation("Sugestão da IA recebida e atribuída ao chamado (trunc): {Resp}", respostaIa.Length > 500 ? respostaIa.Substring(0, 500) + "..." : respostaIa);
                }
            }
            else
            {
                _logger.LogInformation("IA retornou resposta vazia para o prompt.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao consultar a IA ao criar chamado");
        }

        // Se a UI ainda enviou uma categoria (por compatibilidade), respeitamos; caso contrário, o campo já foi preenchido pela IA acima
        if (string.IsNullOrWhiteSpace(novoChamado.CategoriaChamado) && !string.IsNullOrWhiteSpace(chamadoDto.Categoria))
        {
            novoChamado.CategoriaChamado = chamadoDto.Categoria;
        }

        _context.Chamados.Add(novoChamado);
        await _context.SaveChangesAsync();

        var resultDto = new ChamadoSummaryDto(
            novoChamado.ChamadoId,
            novoChamado.TituloChamado,
            novoChamado.CategoriaChamado ?? "Outros",
            novoChamado.PrioridadeChamado,
            novoChamado.StatusChamado,
            novoChamado.DataAbertura,
            solicitante.Nome,
            null
        );

        return CreatedAtAction(nameof(GetChamado), new { id = novoChamado.ChamadoId }, resultDto);
    }

    // PUT: api/chamados/5/status
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateChamadoStatus(int id, [FromBody] UpdateChamadoStatusDto statusDto)
    {
        var chamado = await _context.Chamados.FindAsync(id);

        if (chamado == null)
        {
            return NotFound();
        }

        chamado.StatusChamado = statusDto.NovoStatus;
        chamado.DataUltimaModificacao = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/chamados/5/transferir
    [HttpPost("{id}/transferir")]
    public async Task<IActionResult> TransferirChamado(int id, [FromBody] TransferChamadoDto transferDto)
    {
        var chamado = await _context.Chamados.FindAsync(id);
        if (chamado == null)
        {
            return NotFound(new { message = "Chamado não encontrado." });
        }

        var novoAtendente = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == transferDto.NovoAtendenteId && u.Ativo);
        if (novoAtendente == null)
        {
            return BadRequest(new { message = "Técnico inválido ou inativo." });
        }

        chamado.AtendenteId = transferDto.NovoAtendenteId;
        chamado.DataUltimaModificacao = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/chamados/5/mensagens
    [HttpGet("{id}/mensagens")]
    public async Task<ActionResult<IEnumerable<MensagemDto>>> GetChamadoMensagens(int id)
    {
        if (!await _context.Chamados.AnyAsync(c => c.ChamadoId == id))
        {
            return NotFound(new { message = "Chamado não encontrado." });
        }

        // Materialize the Interacoes after ordering by DataCriacao so EF Core can translate
        // the ordering on the entity. Project to DTOs in-memory to allow null handling for Usuario.
        var interacoes = await _context.Interacoes
            .Include(i => i.Usuario)
            .Where(i => i.ChamadoId == id)
            .OrderBy(i => i.DataCriacao)
            .ToListAsync();

        var dtos = interacoes.Select(i => new MensagemDto(
            i.Id,
            i.ChamadoId,
            i.UsuarioId,
            i.Usuario != null ? i.Usuario.Nome : "Usuário Desconhecido",
            i.Mensagem,
            i.DataCriacao
        )).ToList();

        return Ok(dtos);
    }

    // POST: api/chamados/5/mensagens
    [HttpPost("{id}/mensagens")]
    public async Task<ActionResult<MensagemDto>> CreateMensagem(int id, [FromBody] CreateMensagemDto mensagemDto)
    {
        var chamado = await _context.Chamados.FindAsync(id);
        if (chamado == null)
        {
            return NotFound(new { message = "Chamado não encontrado." });
        }

        var usuario = await _context.Usuarios.FindAsync(mensagemDto.UsuarioId);
        if (usuario == null)
        {
            return BadRequest(new { message = "Usuário inválido." });
        }

        var novaInteracao = new Interacao
        {
            ChamadoId = id,
            UsuarioId = mensagemDto.UsuarioId,
            Mensagem = mensagemDto.Mensagem,
            DataCriacao = DateTime.UtcNow
        };

        chamado.DataUltimaModificacao = DateTime.UtcNow;

        _context.Interacoes.Add(novaInteracao);
        await _context.SaveChangesAsync();

        var resultDto = new MensagemDto(
            novaInteracao.Id,
            novaInteracao.ChamadoId,
            novaInteracao.UsuarioId,
            usuario != null ? usuario.Nome : "N/A",
            novaInteracao.Mensagem,
            novaInteracao.DataCriacao
        );

        return CreatedAtAction(nameof(GetChamadoMensagens), new { id }, resultDto);
    }

    // POST: api/chamados/5/resolver-com-ia
    [HttpPost("{id}/resolver-com-ia")]
    public async Task<IActionResult> ResolverComIa(int id, [FromBody] ResolverComIaDto dto)
    {
        var chamado = await _context.Chamados.FindAsync(id);
        if (chamado == null)
        {
            return NotFound();
        }

        chamado.StatusChamado = "Resolvido por IA";
        chamado.SolucaoSugerida = dto.Solucao;
        chamado.SolucaoAplicada = dto.Solucao;
        chamado.DataUltimaModificacao = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }


// GET: api/chamados/5/usuario
    [HttpGet("{id}/usuario")]
    public async Task<ActionResult<UsuarioDto>> GetUsuarioByChamado(int id)
    {
        var chamado = await _context.Chamados
            .Include(c => c.Solicitante)
            .FirstOrDefaultAsync(c => c.ChamadoId == id);

        if (chamado == null || chamado.Solicitante == null)
        {
            return NotFound(); // Retorna 404 se não encontrar
        }

        var usuario = chamado.Solicitante;

        var usuarioDto = new UsuarioDto(usuario.Id, usuario.Nome, usuario.Email, usuario.Telefone, usuario.Setor, usuario.Cargo);
        return Ok(usuarioDto);
    }

// POST: api/chamados/5/usuario
    [HttpPost("{id}/usuario")]
    public async Task<ActionResult<UsuarioDto>> CreateUsuarioForChamado(int id, [FromBody] CreateUsuarioDto usuarioDto)
    {
        var chamado = await _context.Chamados
            .Include(c => c.Solicitante)
            .FirstOrDefaultAsync(c => c.ChamadoId == id);

        if (chamado == null)
        {
            return NotFound(new { message = "Chamado não encontrado." });
        }

        if (await _context.Usuarios.AnyAsync(u => u.Email == usuarioDto.Email))
        {
            return BadRequest(new { mensagem = "Este email já está em uso." });
        }

        var novoUsuario = new Usuario
        {
            Nome = usuarioDto.Nome,
            Email = usuarioDto.Email,
            Telefone = usuarioDto.Telefone,
            Setor = usuarioDto.Setor,
            Cargo = usuarioDto.Cargo,
            Senha = PasswordService.HashPassword(usuarioDto.Senha)
        };

        _context.Usuarios.Add(novoUsuario);
        await _context.SaveChangesAsync();

        // Associa o novo usuário como solicitante do chamado
        chamado.SolicitanteId = novoUsuario.Id;
        await _context.SaveChangesAsync();

        var resultDto = new UsuarioDto(novoUsuario.Id, novoUsuario.Nome, novoUsuario.Email, novoUsuario.Telefone, novoUsuario.Setor, novoUsuario.Cargo);

        return CreatedAtAction(nameof(GetUsuarioByChamado), new { id = chamado.ChamadoId }, resultDto);
    }
}