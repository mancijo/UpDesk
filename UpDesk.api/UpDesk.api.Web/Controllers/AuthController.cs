using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UpDesk.Api.Data;
using UpDesk.Api.Dtos;
using UpDesk.Api.Services;
using UpDesk.Api.Models;  

namespace UpDesk.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtService _jwtService;

        public AuthController(ApplicationDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
        {
            // 1. Busca o usuário pelo email no banco de dados
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == loginRequest.Email && u.Ativo);

            // 2. Se o usuário não for encontrado, retorna um erro
            if (usuario == null)
            {
                return Unauthorized(new { mensagem = "Email ou senha incorretos" });
            }

            // 3. Verifica se a senha está correta
            bool isPasswordCorrect = BCrypt.Net.BCrypt.Verify(loginRequest.Senha, usuario.Senha);

            if (!isPasswordCorrect)
            {
                return Unauthorized(new { mensagem = "Email ou senha incorretos" });
            }

            // 4. Prepara os dados do usuário para retornar ao front-end
            var usuarioDto = new UsuarioDto(usuario.Id, usuario.Nome, usuario.Email, usuario.Telefone, usuario.Setor, usuario.Cargo);

            // 5. Gera um Token de Autenticação (JWT)
            var token = _jwtService.GenerateToken(usuario);

            // 6. Retorna sucesso com os dados do usuário e o token
            return Ok(new { 
                mensagem = "Login realizado com sucesso!", 
                usuario = usuarioDto,
                token = token 
            });
        }
    }
}