
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
        var chamadosEmAndamento = await _context.Chamados.CountAsync(c => c.StatusChamado == "Em Andamento");
        var chamadosPendentes = await _context.Chamados.CountAsync(c => c.StatusChamado == "Pendente");
        var chamadosResolvidos = await _context.Chamados.CountAsync(c => c.StatusChamado == "Resolvido");
        var chamadosFechados = await _context.Chamados.CountAsync(c => c.StatusChamado == "Fechado");

        var stats = new DashboardStatsDto(
            TotalChamados: totalChamados,
            ChamadosAbertos: chamadosAbertos,
            ChamadosEmAndamento: chamadosEmAndamento,
            ChamadosPendentes: chamadosPendentes,
            ChamadosResolvidos: chamadosResolvidos,
            ChamadosFechados: chamadosFechados
        );

        return Ok(stats);
    }
}
