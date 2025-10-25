using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UpDesk.Api.Data;
using UpDesk.Api.Dtos;
using UpDesk.Api.Models;
using UpDesk.Api.Services;

namespace UpDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChamadosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    private readonly IaiService _iaService;

    public ChamadosController(ApplicationDbContext context, IaiService iaService)
    {
        _context = context;
        _iaService = iaService;
    }

    // GET: api/chamados
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ChamadoSummaryDto>>> GetChamados([FromQuery] string? status, [FromQuery] string? q)
    {
        var query = _context.Chamados
            .Include(c => c.Solicitante)
            .Include(c => c.Atendente)
            .AsQueryable();

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
            CategoriaChamado = chamadoDto.Categoria,
            PrioridadeChamado = chamadoDto.Prioridade,
            StatusChamado = "Aberto",
            DataAbertura = DateTime.UtcNow,
            DataUltimaModificacao = DateTime.UtcNow
        };

        // 🔹 Envia a descrição do problema para a IA Gemini
        try
        {
            // Usa o serviço de IA via contrato IaiService (pode ser mock ou Gemini)
            string respostaIa = await _iaService.BuscarSolucaoAsync(chamadoDto.Titulo, chamadoDto.Descricao);

            if (!string.IsNullOrWhiteSpace(respostaIa))
            {
                novoChamado.SolucaoSugerida = respostaIa;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erro ao consultar a IA: {ex.Message}");
        }

        _context.Chamados.Add(novoChamado);
        await _context.SaveChangesAsync();

        var resultDto = new ChamadoSummaryDto(
            novoChamado.ChamadoId,
            novoChamado.TituloChamado,
            novoChamado.CategoriaChamado,
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

        return await _context.Interacoes
            .Include(i => i.Usuario)
            .Where(i => i.ChamadoId == id)
            .Select(i => new MensagemDto(
                i.Id,
                i.ChamadoId,
                i.UsuarioId,
                i.Usuario.Nome,
                i.Mensagem,
                i.DataCriacao
            ))
            .OrderBy(m => m.DataCriacao)
            .ToListAsync();
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
}