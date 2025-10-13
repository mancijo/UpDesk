using System.Text;
using System.Text.Json;

namespace UpDesk.Api.Services;

public interface IaiService
{
    Task<string> BuscarSolucaoAsync(string titulo, string descricao);
}

public class GeminiIaService : IaiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public GeminiIaService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> BuscarSolucaoAsync(string titulo, string descricao)
    {
        try
        {
            var apiKey = _configuration["Gemini:ApiKey"];
            if (string.IsNullOrEmpty(apiKey))
            {
                Console.WriteLine("ERRO: Chave da API do Gemini não configurada");
                return "Serviço de IA não configurado. Entre em contato com o suporte técnico.";
            }

            Console.WriteLine($"Tentando buscar solução para: {titulo}");

            var prompt = $@"Aja como um especialista de suporte técnico de TI (Nível 1). Um usuário está relatando o seguinte problema:

Título do Chamado: ""{titulo}""
Descrição do Problema: ""{descricao}""

Forneça uma solução clara e em formato de passo a passo para um usuário final. A resposta deve ser direta e fácil de entender. Se não tiver certeza, sugira coletar mais informações que poderiam ajudar no diagnóstico.

Formato da resposta:
1. Diagnóstico rápido do problema
2. Soluções passo a passo
3. Se necessário, informações adicionais para coletar
4. Quando escalar para o próximo nível de suporte";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.7,
                    topK = 40,
                    topP = 0.95,
                    maxOutputTokens = 1024
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={apiKey}", content);

            Console.WriteLine($"Status da resposta: {response.StatusCode}");

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Resposta da API: {responseContent}");
                
                var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent);

                if (geminiResponse?.candidates?.Length > 0 && 
                    geminiResponse.candidates[0]?.content?.parts?.Length > 0)
                {
                    var text = geminiResponse.candidates[0].content.parts[0].text;
                    Console.WriteLine($"Texto extraído: {text}");
                    return !string.IsNullOrEmpty(text) ? text : "Nenhuma sugestão disponível.";
                }
                else
                {
                    Console.WriteLine("Resposta da API não contém candidatos válidos");
                }
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Erro da API: {errorContent}");
            }

            return "Não foi possível obter uma sugestão da IA no momento. Por favor, prossiga com a abertura do chamado.";
        }
        catch (Exception ex)
        {
            // Log do erro (em produção, use um logger adequado)
            Console.WriteLine($"Erro ao buscar solução com IA: {ex.Message}");
            return "Erro interno ao consultar a IA. Por favor, prossiga com a abertura do chamado.";
        }
    }
}

// Classes para deserializar a resposta do Gemini
public class GeminiResponse
{
    public Candidate[]? candidates { get; set; }
}

public class Candidate
{
    public Content? content { get; set; }
}

public class Content
{
    public Part[]? parts { get; set; }
}

public class Part
{
    public string? text { get; set; }
}
