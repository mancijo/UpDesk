using Microsoft.AspNetCore.Mvc;
using UpDesk.Api.Dtos;

namespace UpDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IaController : ControllerBase
{
    public IaController()
    {
    }

    // POST: api/ia/sugerir-solucao
    [HttpPost("sugerir-solucao")]
    public IActionResult SugerirSolucao([FromBody] SugestaoIaDto dto)
    {
        // --- IMPLEMENTAÇÃO DE EXEMPLO (MOCK) ---
        // Aqui você integraria com um serviço de IA (ex: OpenAI, Azure AI, etc.)
        // Por enquanto, retornamos uma sugestão fixa baseada no título.

        if (string.IsNullOrWhiteSpace(dto.Titulo) || string.IsNullOrWhiteSpace(dto.Descricao))
        {
            return BadRequest(new { message = "Título e descrição são obrigatórios." });
        }

        string solucaoSugerida = $"Para o problema \"{dto.Titulo}\", a sugestão mais comum é verificar se o dispositivo está corretamente conectado à energia e reiniciar o sistema. Se o problema persistir, verifique os logs de erro.";

        return Ok(new { solucao = solucaoSugerida });
    }
}
