
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UpDesk.Api.Data;
using UpDesk.Api.Dtos;

namespace UpDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TecnicosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TecnicosController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/tecnicos
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TecnicoDto>>> GetTecnicos()
    {
        // Filtra usuários ativos que são técnicos. 
        // Ajuste o valor de "Cargo" se o nome da role for diferente.
        var tecnicos = await _context.Usuarios
            .Where(u => u.Ativo && (u.Cargo.ToLower() == "técnico" || u.Cargo.ToLower() == "tecnico"))
            .Select(u => new TecnicoDto(u.Id, u.Nome))
            .ToListAsync();

        return Ok(tecnicos);
    }
}
