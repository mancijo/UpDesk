using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UpDesk.Api.Data;
using UpDesk.Api.Dtos;

namespace UpDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/dashboard/stats
    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        var totalChamados = await _context.Chamados.CountAsync();
        var chamadosAbertos = await _context.Chamados.CountAsync(c => c.StatusChamado == "Aberto");
        var chamadosEmTriagem = await _context.Chamados.CountAsync(c => c.StatusChamado == "Em triagem");
        var chamadosEmAtendimento = await _context.Chamados.CountAsync(c => c.StatusChamado == "Em atendimento");
        var chamadosSolucaoIA = await _context.Chamados.CountAsync(c => c.StatusChamado == "Resolvido por IA");
        var chamadosFinalizados = await _context.Chamados.CountAsync(c => c.StatusChamado == "Resolvido");

        var stats = new DashboardStatsDto(
            TotalChamados: totalChamados,
            ChamadosAbertos: chamadosAbertos,
            ChamadosEmTriagem: chamadosEmTriagem, // Correção: Passando o valor para o parâmetro correto.
            ChamadosSolucaoIA: chamadosSolucaoIA,
            ChamadosEmAtendimento: chamadosEmAtendimento,
            ChamadosFinalizados: chamadosFinalizados // Adicionando o parâmetro que faltava. Ajuste se tiver uma contagem para "Triagem".
        );

        return Ok(stats);
    }
}