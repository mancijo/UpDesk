using System.Text;
using System.Text.Json;

namespace UpDesk.Api.Services;

public interface IaiService
{
    Task<string> BuscarSolucaoAsync(string titulo, string descricao);
    Task<string> ClassifyCategoryAsync(string titulo, string descricao);
}

