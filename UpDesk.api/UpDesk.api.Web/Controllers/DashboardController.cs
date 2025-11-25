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
        var chamadosEmTriagem = await _context.Chamados.CountAsync(c => c.StatusChamado == "Em Atendimento");
        var chamadosSolucaoIA = await _context.Chamados.CountAsync(c => c.StatusChamado == "Resolvido por IA");
        var chamadosFinalizados = await _context.Chamados.CountAsync(c => c.StatusChamado == "Resolvido");

        var stats = new DashboardStatsDto(
            TotalChamados: totalChamados,
            ChamadosAbertos: chamadosAbertos,
            ChamadosEmAtendimento: chamadosEmTriagem, // Correção: Passando o valor para o parâmetro correto.
            ChamadosSolucaoIA: chamadosSolucaoIA,
            ChamadosFinalizados: chamadosFinalizados,
            ChamadosEmTriagem: 0 // Adicionando o parâmetro que faltava. Ajuste se tiver uma contagem para "Triagem".
        );

        return Ok(stats);
    }
}