using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UpDesk.Api.Data;
using UpDesk.Api.Dtos;
using UpDesk.Api.Models;
using UpDesk.Api.Services;

namespace UpDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsuariosController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/usuarios
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetUsuarios([FromQuery] string? q)
    {
        var query = _context.Usuarios.Where(u => u.Ativo).AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
        {
            query = query.Where(u => u.Nome.Contains(q) || u.Email.Contains(q));
        }

        // Usamos 'await' aqui para esperar o banco de dados
        return await query
            .Select(u => new UsuarioDto(u.Id, u.Nome, u.Email, u.Telefone, u.Setor, u.Cargo))
            .ToListAsync();
    }

    // GET: api/usuarios/5
    [HttpGet("{id}")]
    public async Task<ActionResult<UsuarioDto>> GetUsuarioById(int id)
    {
        // Usamos 'await' aqui para esperar o banco de dados
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id && u.Ativo);

        if (usuario == null)
        {
            return NotFound(); // Retorna 404 se não encontrar
        }

        var usuarioDto = new UsuarioDto(usuario.Id, usuario.Nome, usuario.Email, usuario.Telefone, usuario.Setor, usuario.Cargo);
        return Ok(usuarioDto);
    }

    // POST: api/usuarios
    [HttpPost]
    public async Task<ActionResult<UsuarioDto>> CreateUsuario([FromBody] CreateUsuarioDto usuarioDto)
    {
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
        // Usamos 'await' aqui para salvar as mudanças no banco
        await _context.SaveChangesAsync();

        var resultDto = new UsuarioDto(novoUsuario.Id, novoUsuario.Nome, novoUsuario.Email, novoUsuario.Telefone, novoUsuario.Setor, novoUsuario.Cargo);

        return CreatedAtAction(nameof(GetUsuarioById), new { id = novoUsuario.Id }, resultDto);
    }

    // PUT: api/usuarios/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUsuario(int id, [FromBody] UpdateUsuarioDto usuarioDto)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario == null || !usuario.Ativo)
        {
            return NotFound();
        }

        // Atualiza as propriedades
        usuario.Nome = usuarioDto.Nome;
        usuario.Email = usuarioDto.Email;
        usuario.Telefone = usuarioDto.Telefone;
        usuario.Setor = usuarioDto.Setor;
        usuario.Cargo = usuarioDto.Cargo;

        // Usamos 'await' aqui para salvar as mudanças no banco
        await _context.SaveChangesAsync();

        return NoContent(); // Retorna 204 em caso de sucesso
    }

    // DELETE: api/usuarios/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario == null)
        {
            return NotFound();
        }

        // Em vez de deletar, uma prática comum é inativar o usuário (soft delete)
        usuario.Ativo = false;
        // Se quiser deletar de verdade, use: _context.Usuarios.Remove(usuario);

        // Usamos 'await' aqui para salvar as mudanças no banco
        await _context.SaveChangesAsync();

        return NoContent();
    }
}