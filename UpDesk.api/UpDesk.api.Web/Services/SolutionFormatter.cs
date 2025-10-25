using System;
using System.Linq;
using System.Text;

namespace UpDesk.Api.Services;

public static class SolutionFormatter
{
    // Produz um resumo curto e formatado da solução fornecida pela IA
    public static string Summarize(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return "Sem informação disponível.";

        // Normaliza quebras de linha
        var text = raw.Replace("\r", "").Trim();

    // Tenta extrair diagnóstico (removendo frases empáticas iniciais)
    string diagnosis = ExtractDiagnosis(text);

        // Tenta extrair passos (linhas que começam com dígitos, '-' ou itens enumerados)
        var steps = ExtractSteps(text)
            .Where(s => !string.IsNullOrWhiteSpace(s) && s.Trim().Length > 4)
            .ToArray();

        // Se não encontrou passos úteis, gera passos heurísticos mais relevantes
        if (!steps.Any())
        {
            steps = GenerateHeuristicSteps(text);
        }

        // Monta saída em Markdown (mais legível no front-end)
        var sb = new StringBuilder();
        sb.AppendLine("## Diagnóstico");
        sb.AppendLine();
        sb.AppendLine(Shorten(diagnosis, 300));
        sb.AppendLine();
        sb.AppendLine("### Solução resumida");
        sb.AppendLine();
        int i = 1;
        foreach (var s in steps.Where(s => !string.IsNullOrWhiteSpace(s)).Take(6))
        {
            var clean = s.Trim();
            // pular itens inúteis
            if (clean.Length < 5) continue;
            sb.AppendLine($"{i++}. {Shorten(clean, 300)}");
        }

        sb.AppendLine();
        sb.AppendLine("> Se precisar, forneça mais detalhes (mensagem de erro, quando ocorre) para uma sugestão mais precisa.");

        return sb.ToString().Trim();
    }

    private static string ExtractDiagnosis(string text)
    {
        var markers = new[] { "**Diagnóstico:**", "Diagnóstico:", "Diagnostico:" };
        foreach (var m in markers)
        {
            var idx = text.IndexOf(m, StringComparison.OrdinalIgnoreCase);
            if (idx >= 0)
            {
                var after = text.Substring(idx + m.Length).TrimStart();
                var end = after.IndexOf('\n');
                if (end > 0)
                    return after.Substring(0, end).Trim();
                return after;
            }
        }

        // Fallback: primeira linha curta, removendo frases de empatia muito genéricas
        var firstLine = text.Split('\n').FirstOrDefault() ?? text;
        // Remover linhas iniciais que sejam apenas empatia (Ex: "Compreendo a situação frustrante!")
        if (firstLine.StartsWith("Compreendo", StringComparison.OrdinalIgnoreCase) ||
            firstLine.StartsWith("Sinto", StringComparison.OrdinalIgnoreCase) ||
            firstLine.StartsWith("Entendo", StringComparison.OrdinalIgnoreCase))
        {
            var rest = text.Split('\n').Skip(1).FirstOrDefault(l => !string.IsNullOrWhiteSpace(l));
            if (!string.IsNullOrWhiteSpace(rest)) firstLine = rest;
        }

        return firstLine.Length <= 200 ? firstLine : Shorten(firstLine, 140);
    }

    private static string[] ExtractSteps(string text)
    {
        var lines = text.Split('\n')
            .Select(l => l.Trim())
            .Where(l => !string.IsNullOrWhiteSpace(l))
            .ToArray();
        // Filtra linhas irrelevantes como "Título:" ou "Descrição:" e remove marcações Markdown
        var filtered = lines
            .Where(l => !l.StartsWith("Título:", StringComparison.OrdinalIgnoreCase) && !l.StartsWith("Descrição:", StringComparison.OrdinalIgnoreCase))
            .Select(l => l.Replace("**", string.Empty).Replace("__", string.Empty).Trim())
            .Where(l => !string.IsNullOrWhiteSpace(l))
            .ToArray();

        // Procura linhas que contenham ação/instrução
        var candidates = filtered.Where(l =>
            // itens numerados ou marcadores
                System.Text.RegularExpressions.Regex.IsMatch(l, @"^\d+([.)])\s*") ||
            l.StartsWith("-") || l.StartsWith("*") ||
            // palavras-chave de verificação
            l.IndexOf("verif", StringComparison.OrdinalIgnoreCase) >= 0 ||
            l.IndexOf("reinici", StringComparison.OrdinalIgnoreCase) >= 0 ||
            l.IndexOf("teste", StringComparison.OrdinalIgnoreCase) >= 0 ||
            l.IndexOf("tente", StringComparison.OrdinalIgnoreCase) >= 0 ||
            l.IndexOf("cheque", StringComparison.OrdinalIgnoreCase) >= 0 ||
            l.IndexOf("conect", StringComparison.OrdinalIgnoreCase) >= 0
        ).ToArray();

        if (candidates.Any())
        {
            // limpa numeracao e marcadores
                return candidates.Select(c => System.Text.RegularExpressions.Regex.Replace(c, @"^\s*\d+[\.\)]\s*", "").TrimStart('-', '*', ' ').Trim()).ToArray();
        }

        // Busca linhas que pareçam instruções (começam com verbo ou têm comprimento razoável)
        var verbLike = filtered.Where(l => l.Length > 25 && (l.StartsWith("Verifique", StringComparison.OrdinalIgnoreCase) || l.StartsWith("Reinicie", StringComparison.OrdinalIgnoreCase) || l.StartsWith("Teste", StringComparison.OrdinalIgnoreCase) || l.StartsWith("Tente", StringComparison.OrdinalIgnoreCase) || Char.IsLower(l.FirstOrDefault()))).ToArray();
        return verbLike;
    }

    private static string[] GenerateHeuristicSteps(string text)
    {
        // heurísticas mais adaptadas a problemas de hardware/monitor
        var lower = text.ToLowerInvariant();
        var monitorKeywords = new[] {"monitor", "tela", "sem imagem", "sem imagem", "video", "vídeo", "display"};
        bool seemsMonitor = monitorKeywords.Any(k => lower.Contains(k));

        if (seemsMonitor)
        {
            return new[] {
                "Verifique se o monitor está ligado e se o indicador de energia (LED) acende.",
                "Cheque o cabo de vídeo (HDMI/DisplayPort/VGA): desconecte e reconecte em ambas as extremidades.",
                "Teste outro cabo ou outra porta de vídeo; se possível, teste o monitor em outro computador.",
                "Confirme que a fonte de alimentação do monitor (separada) está funcionando e que não há interruptores de energia desligados.",
                "Se o computador mostra sinais de boot (ventoinha/LEDs) mas não há imagem, tente conectar outro monitor ou usar a porta de vídeo integrada/GPU alternativa.",
                "Atualize ou reinstale o driver de vídeo e, se necessário, verifique configurações de BIOS/UEFI relacionadas a saída de vídeo."
            };
        }

        return new[] {
            "Reinicie o dispositivo/computador.",
            "Verifique conexões e cabos (alimentação, rede, periféricos).",
            "Teste o equipamento em outra porta ou em outro computador.",
            "Atualize ou reinstale drivers ou software relacionado."
        };
    }

    private static string Shorten(string s, int max)
    {
        if (string.IsNullOrEmpty(s)) return s;
        if (s.Length <= max) return s;
        var cut = s.Substring(0, max);
        var lastSpace = cut.LastIndexOf(' ');
        if (lastSpace > 0) cut = cut.Substring(0, lastSpace);
        return cut + "...";
    }
}
