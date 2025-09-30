// Local do arquivo: Controllers/AuthController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UpDesk.Api.Data;
using UpDesk.Api.Dtos;
using UpDesk.Api.Services;

namespace UpDesk.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        // 1. A variável _context é declarada aqui, para a classe inteira
        private readonly ApplicationDbContext _context;

        // 2. O construtor recebe o DbContext e o atribui à variável _context
        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 3. O método Login fica aqui, no mesmo nível do construtor, DENTRO da classe
        // Local do arquivo: Controllers/AuthController.cs

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == loginRequest.Email && u.Ativo);

            if (usuario == null)
            {
                return Unauthorized(new { mensagem = "Email ou senha incorretos" });
            }

            bool isPasswordCorrect = false;
            bool needsUpgrade = false;

            // --- LÓGICA DE MIGRAÇÃO CORRIGIDA ---

            // 1. Procura pelo prefixo "scrypt" que vimos no debug
            if (usuario.Senha.StartsWith("scrypt:"))
            {
                needsUpgrade = true;
                // Chama o novo método para verificar senhas scrypt
                isPasswordCorrect = PasswordService.VerifyScryptPassword(loginRequest.Senha, usuario.Senha);
            }
            else // Senão, assume que é o formato novo (BCrypt)
            {
                isPasswordCorrect = PasswordService.VerifyPassword(loginRequest.Senha, usuario.Senha);
            }
            // --- FIM DA LÓGICA DE MIGRAÇÃO ---

            if (!isPasswordCorrect)
            {
                return Unauthorized(new { mensagem = "Email ou senha incorretos" });
            }

            // --- ATUALIZAÇÃO DA SENHA ---
            if (needsUpgrade && isPasswordCorrect)
            {
                try
                {
                    usuario.Senha = PasswordService.HashPassword(loginRequest.Senha);
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Falha ao atualizar a senha para o usuário {usuario.Email}: {ex.Message}");
                }
            }
            // --- FIM DA ATUALIZAÇÃO DA SENHA ---

            var usuarioDto = new UsuarioDto(usuario.Id, usuario.Nome, usuario.Email, usuario.Telefone, usuario.Setor, usuario.Cargo);

            return Ok(new { mensagem = "Login realizado com sucesso!", usuario = usuarioDto });
        }
    }
}