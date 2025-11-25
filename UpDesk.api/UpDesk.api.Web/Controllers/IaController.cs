using Microsoft.AspNetCore.Mvc;
using UpDesk.Api.Dtos;
using UpDesk.Api.Services;

namespace UpDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IaController : ControllerBase
{
    private readonly IaiService _iaService;

    public IaController(IaiService iaService)
    {
        _iaService = iaService;
    }

    // POST: api/ia/sugerir-solucao
    [HttpPost("sugerir-solucao")]
    public async Task<IActionResult> SugerirSolucao([FromBody] SugestaoIaDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Titulo) || string.IsNullOrWhiteSpace(dto.Descricao))
        {
            return BadRequest(new { message = "Título e descrição são obrigatórios." });
        }

        try
        {
            var solucaoSugerida = await _iaService.BuscarSolucaoAsync(dto.Titulo, dto.Descricao);
            return Ok(new { solucao = solucaoSugerida });
        }
        catch (Exception)
        {
            // Em caso de erro, retorna uma sugestão genérica
            var solucaoFallback = $"Para o problema \"{dto.Titulo}\", sugerimos verificar se o dispositivo está corretamente conectado e reiniciar o sistema. Se o problema persistir, entre em contato com o suporte técnico.";
            return Ok(new { solucao = solucaoFallback });
        }
    }
}
