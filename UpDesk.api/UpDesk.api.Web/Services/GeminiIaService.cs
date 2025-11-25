using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Http;

namespace UpDesk.Api.Services
{
    public class GeminiIaService : IaiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _model;
        private readonly ILogger<GeminiIaService> _logger;

        public GeminiIaService(IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<GeminiIaService> logger)
        {
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.Timeout = TimeSpan.FromSeconds(30);
            _apiKey = configuration["Gemini:ApiKey"] ?? throw new ArgumentNullException("Gemini:ApiKey", "A chave da API Gemini não foi encontrada no appsettings.json.");
            _model = "gemini-2.5-flash"; // modelo estável e rápido
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // Implementa o contrato IaiService
        public async Task<string> BuscarSolucaoAsync(string titulo, string descricao)
        {
            // Concatena título e descrição para formar a pergunta ao modelo
            var pergunta = $"Titulo: {titulo}\nDescricao: {descricao}";
            var resposta = await ObterRespostaAsync(pergunta);

            // Retorna versão resumida e formatada da resposta da IA
            return SolutionFormatter.Summarize(resposta);
        }

        public async Task<string> ClassifyCategoryAsync(string titulo, string descricao)
        {
            // Monta um prompt claro pedindo apenas a categoria curta
            var prompt = $"Classifique a categoria deste chamado em uma única palavra curta entre: Hardware, Impressora, Performance, Autenticação, Rede, Software, Outros.\nTitulo: {titulo}\nDescricao: {descricao}\nRetorne apenas a categoria:";
            _logger.LogInformation("Solicitando classificação de categoria para chamado (trunc): {Preview}", (titulo + " - " + (descricao ?? string.Empty)).Length > 400 ? (titulo + " - " + (descricao ?? string.Empty)).Substring(0,400) + "..." : (titulo + " - " + (descricao ?? string.Empty)));

            var resposta = await ObterRespostaAsync(prompt);

            if (string.IsNullOrWhiteSpace(resposta))
            {
                _logger.LogWarning("Classificação da IA retornou vazia, usando 'Outros'");
                return "Outros";
            }

            // Tenta normalizar a resposta para uma das categorias conhecidas
            var normalized = resposta.Trim().Split(new[] {'\n', '\r'}, StringSplitOptions.RemoveEmptyEntries)[0].Trim();
            normalized = normalized.Replace(".", "").Replace("\"", "").Trim();

            var candidates = new[] { "Hardware", "Impressora", "Performance", "Autenticação", "Rede", "Software", "Outros" };
            foreach (var c in candidates)
            {
                if (normalized.Equals(c, StringComparison.OrdinalIgnoreCase) || normalized.IndexOf(c, StringComparison.OrdinalIgnoreCase) >= 0)
                    return c;
            }

            // Heurística simples: procurar palavras-chave
            var low = normalized.ToLowerInvariant();
            if (low.Contains("mouse") || low.Contains("teclado") || low.Contains("monitor") || low.Contains("hardware")) return "Hardware";
            if (low.Contains("impressora") || low.Contains("cartucho") || low.Contains("papel")) return "Impressora";
            if (low.Contains("lentid") || low.Contains("lento") || low.Contains("desempenho")) return "Performance";
            if (low.Contains("login") || low.Contains("senha") || low.Contains("autent")) return "Autenticação";
            if (low.Contains("rede") || low.Contains("wifi") || low.Contains("internet") || low.Contains("conex")) return "Rede";
            if (low.Contains("erro") || low.Contains("exceção") || low.Contains("bug") || low.Contains("falha")) return "Software";

            _logger.LogInformation("Classificação da IA retornou valor inesperado '{Value}', usando 'Outros'", normalized);
            return "Outros";
        }

        // Método interno que realiza a chamada HTTP para a API Gemini
        public async Task<string> ObterRespostaAsync(string pergunta)
        {
            // Retry policy simples para erros transitórios (503, 500, 429)
            int maxAttempts = 3;
            int attempt = 0;
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";

            // Monta o corpo no formato compatível com a API (mantemos a forma anterior, mas registramos o corpo em log em caso de erro)
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = pergunta }
                        }
                    }
                }
            };

            string jsonRequest = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

            while (true)
            {
                attempt++;
                try
                {
                    _logger.LogInformation("Gemini request attempt {Attempt} to {Url}", attempt, url);

                    using var response = await _httpClient.PostAsync(url, content);

                    var responseText = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogWarning("Gemini returned non-success status {Status} on attempt {Attempt}. Response: {Response}", (int)response.StatusCode, attempt, responseText.Length > 1000 ? responseText.Substring(0, 1000) : responseText);

                        // Retries for server errors or rate-limiting
                        if ((int)response.StatusCode >= 500 || response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                        {
                            if (attempt < maxAttempts)
                            {
                                var delayMs = 500 * (int)Math.Pow(2, attempt - 1);
                                _logger.LogInformation("Retrying Gemini after {Delay}ms", delayMs);
                                await Task.Delay(delayMs);
                                continue;
                            }
                        }

                        // Não é recuperável ou tentativas esgotadas
                        return $"Erro ao se comunicar com a API Gemini: {(int)response.StatusCode} {response.ReasonPhrase}. Tente novamente mais tarde.";
                    }

                    // Parse da resposta (tentar de maneira robusta)
                    try
                    {
                        using JsonDocument doc = JsonDocument.Parse(responseText);
                        var root = doc.RootElement;

                        if (root.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
                        {
                            var first = candidates[0];
                            if (first.TryGetProperty("content", out var contentEl) && contentEl.TryGetProperty("parts", out var parts) && parts.GetArrayLength() > 0)
                            {
                                var text = parts[0].GetProperty("text").GetString();
                                return text ?? "A IA não retornou uma resposta válida.";
                            }
                        }

                        // Se a estrutura for diferente, tentar caminhos alternativos
                        if (root.TryGetProperty("output", out var outputEl) && outputEl.TryGetProperty("content", out var cont2) && cont2.TryGetProperty("text", out var maybeText))
                        {
                            return maybeText.GetString() ?? "A IA não retornou uma resposta válida.";
                        }

                        _logger.LogWarning("Gemini response did not contain expected fields. Full response length: {Len}", responseText.Length);
                        return "A IA retornou um formato inesperado. Tente novamente mais tarde.";
                    }
                    catch (JsonException jex)
                    {
                        _logger.LogError(jex, "Failed to parse Gemini JSON response");
                        return "Erro ao processar a resposta da IA. Tente novamente mais tarde.";
                    }
                }
                catch (HttpRequestException httpEx)
                {
                    _logger.LogWarning(httpEx, "HTTP error while calling Gemini (attempt {Attempt})", attempt);
                    if (attempt < maxAttempts)
                    {
                        var delayMs = 500 * (int)Math.Pow(2, attempt - 1);
                        await Task.Delay(delayMs);
                        continue;
                    }

                    return $"Erro HTTP ao se comunicar com a API Gemini: {httpEx.Message}";
                }
                catch (TaskCanceledException tce)
                {
                    _logger.LogWarning(tce, "Timeout calling Gemini (attempt {Attempt})", attempt);
                    if (attempt < maxAttempts)
                    {
                        var delayMs = 500 * (int)Math.Pow(2, attempt - 1);
                        await Task.Delay(delayMs);
                        continue;
                    }

                    return "Tempo esgotado ao contactar a IA. Tente novamente mais tarde.";
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Unexpected error while calling Gemini");
                    return $"Erro ao processar a resposta da IA: {ex.Message}";
                }
            }
        }
    }
}
