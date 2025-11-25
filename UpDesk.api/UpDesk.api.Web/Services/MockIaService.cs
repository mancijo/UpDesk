using System.Text;
using System.Text.Json;

namespace UpDesk.Api.Services;

public class MockIaService : IaiService
{
    public async Task<string> BuscarSolucaoAsync(string titulo, string descricao)
    {
        // Simula uma chamada assíncrona
        await Task.Delay(1000);

        // Retorna uma solução baseada no título e descrição
        var solucoes = new Dictionary<string, string>
        {
            ["mouse"] = @"**Diagnóstico:** Problema com dispositivo de entrada (mouse)

**Soluções passo a passo:**
1. Verifique se o mouse está conectado corretamente
2. Teste o mouse em outra porta USB
3. Reinicie o computador
4. Verifique se o driver do mouse está atualizado
5. Teste com outro mouse para confirmar se é problema do hardware

**Se o problema persistir:** Entre em contato com o suporte técnico para verificação do hardware.",

            ["impressora"] = @"**Diagnóstico:** Problema com dispositivo de impressão

**Soluções passo a passo:**
1. Verifique se a impressora está ligada e conectada
2. Verifique se há papel na bandeja
3. Limpe os cartuchos de tinta
4. Reinicie a impressora
5. Verifique se o driver está instalado corretamente

**Se o problema persistir:** Pode ser necessário manutenção técnica.",

            ["lentidão"] = @"**Diagnóstico:** Performance do sistema comprometida

**Soluções passo a passo:**
1. Reinicie o computador
2. Feche programas desnecessários
3. Execute limpeza de disco
4. Verifique espaço disponível no HD
5. Execute antivírus para verificar malware

**Se o problema persistir:** Pode ser necessário upgrade de hardware.",

            ["login"] = @"**Diagnóstico:** Problema de autenticação

**Soluções passo a passo:**
1. Verifique se a senha está correta
2. Limpe o cache do navegador
3. Tente em modo incógnito
4. Verifique se a conta não está bloqueada
5. Tente resetar a senha

**Se o problema persistir:** Entre em contato com o administrador do sistema."
        };

        // Busca por palavras-chave no título e descrição
        var textoCompleto = $"{titulo} {descricao}".ToLower();
        
        foreach (var palavra in solucoes.Keys)
        {
            if (textoCompleto.Contains(palavra))
            {
                // Retorna versão resumida e formatada da solução encontrada
                return SolutionFormatter.Summarize(solucoes[palavra]);
            }
        }

        // Solução genérica se não encontrar palavra-chave
        var generic = @"**Diagnóstico:** Problema técnico reportado

**Soluções passo a passo:**
1. Reinicie o dispositivo/equipamento
2. Verifique todas as conexões
3. Teste em outro ambiente se possível
4. Documente o erro exato que aparece
5. Verifique se outros usuários têm o mesmo problema

**Se o problema persistir:** Entre em contato com o suporte técnico para análise mais detalhada.

**Informações adicionais para coletar:**
- Mensagem de erro exata
- Quando o problema começou
- O que estava fazendo quando ocorreu
- Se outros usuários são afetados";

        return SolutionFormatter.Summarize(generic);
    }

    public async Task<string> ClassifyCategoryAsync(string titulo, string descricao)
    {
        await Task.Delay(200); // simula latência

        var text = (titulo + " " + descricao).ToLowerInvariant();

        if (text.Contains("mouse") || text.Contains("teclado") || text.Contains("monitor") || text.Contains("hardware"))
            return "Hardware";
        if (text.Contains("impressora") || text.Contains("cartucho") || text.Contains("papel"))
            return "Impressora";
        if (text.Contains("lentid") || text.Contains("lento") || text.Contains("desempenho"))
            return "Performance";
        if (text.Contains("login") || text.Contains("senha") || text.Contains("autent"))
            return "Autenticação";
        if (text.Contains("rede") || text.Contains("wifi") || text.Contains("internet") || text.Contains("conex"))
            return "Rede";
        if (text.Contains("erro") || text.Contains("exceção") || text.Contains("bug") || text.Contains("falha"))
            return "Software";

        return "Outros";
    }
}
