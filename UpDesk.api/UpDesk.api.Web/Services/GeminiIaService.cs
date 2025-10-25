using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace UpDesk.Api.Services
{
    public class GeminiIaService : IaiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _model;

        public GeminiIaService(IConfiguration configuration)
        {
            _httpClient = new HttpClient();
            _apiKey = configuration["Gemini:ApiKey"] ?? throw new ArgumentNullException("Gemini:ApiKey", "A chave da API Gemini não foi encontrada no appsettings.json.");
            _model = "gemini-2.5-flash"; // modelo estável e rápido
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

        // Método interno que realiza a chamada HTTP para a API Gemini
        public async Task<string> ObterRespostaAsync(string pergunta)
        {
            try
            {
                // 🔹 URL da API
                string url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";

                // 🔹 Corpo da requisição no formato JSON
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

                // 🔹 Fazendo a requisição POST
                var response = await _httpClient.PostAsync(url, content);
                response.EnsureSuccessStatusCode();

                // 🔹 Lendo a resposta JSON
                string jsonResponse = await response.Content.ReadAsStringAsync();

                using JsonDocument doc = JsonDocument.Parse(jsonResponse);
                var root = doc.RootElement;

                // 🔹 Extraindo texto da resposta
                string resposta = root
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                return resposta ?? "A IA não retornou uma resposta válida.";
            }
            catch (HttpRequestException httpEx)
            {
                return $"Erro HTTP ao se comunicar com a API Gemini: {httpEx.Message}";
            }
            catch (Exception ex)
            {
                return $"Erro ao processar a resposta da IA: {ex.Message}";
            }
        }
    }
}
