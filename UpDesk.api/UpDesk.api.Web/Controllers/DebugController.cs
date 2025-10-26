using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Text;

namespace UpDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DebugController : ControllerBase
{
    [HttpPost("echo")]
    public async Task<IActionResult> Echo()
    {
        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        var body = await reader.ReadToEndAsync();
        return Ok(new { raw = body, contentType = Request.ContentType });
    }
}
