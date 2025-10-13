using UpDesk.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace UpDesk.Api.Data;

public static class SeedData
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Verifica se já existem usuários
        if (await context.Usuarios.AnyAsync())
        {
            return; // Já tem dados
        }

        // Cria usuários de teste
        var usuarios = new List<Usuario>
        {
            new Usuario
            {
                Nome = "Mateus Teodoro",
                Email = "mateus@updesk.com",
                Telefone = "11999999999",
                Setor = "TI",
                Cargo = "Supervisor",
                Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                Ativo = true
            },
            new Usuario
            {
                Nome = "João Silva",
                Email = "joao@updesk.com",
                Telefone = "11888888888",
                Setor = "TI",
                Cargo = "Técnico N1",
                Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                Ativo = true
            },
            new Usuario
            {
                Nome = "Maria Santos",
                Email = "maria@updesk.com",
                Telefone = "11777777777",
                Setor = "RH",
                Cargo = "Usuário Comum",
                Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                Ativo = true
            }
        };

        context.Usuarios.AddRange(usuarios);
        await context.SaveChangesAsync();

        // Cria alguns chamados de teste
        var chamados = new List<Chamado>
        {
            new Chamado
            {
                TituloChamado = "Problema com impressora",
                DescricaoChamado = "A impressora do setor não está imprimindo corretamente. As páginas saem com linhas horizontais.",
                CategoriaChamado = "Hardware",
                PrioridadeChamado = "Média",
                StatusChamado = "Aberto",
                SolicitanteId = usuarios[2].Id, // Maria
                DataAbertura = DateTime.UtcNow.AddDays(-2)
            },
            new Chamado
            {
                TituloChamado = "Erro no sistema de login",
                DescricaoChamado = "Não consigo fazer login no sistema. Aparece erro de 'usuário não encontrado'.",
                CategoriaChamado = "Software",
                PrioridadeChamado = "Alta",
                StatusChamado = "Em Atendimento",
                SolicitanteId = usuarios[2].Id, // Maria
                AtendenteId = usuarios[1].Id, // João
                DataAbertura = DateTime.UtcNow.AddDays(-1)
            },
            new Chamado
            {
                TituloChamado = "Lentidão no computador",
                DescricaoChamado = "O computador está muito lento para abrir programas e navegar na internet.",
                CategoriaChamado = "Hardware",
                PrioridadeChamado = "Baixa",
                StatusChamado = "Resolvido",
                SolicitanteId = usuarios[2].Id, // Maria
                AtendenteId = usuarios[1].Id, // João
                SolucaoSugerida = "Recomendamos limpeza do disco rígido e desinstalação de programas desnecessários.",
                DataAbertura = DateTime.UtcNow.AddDays(-5),
                DataUltimaModificacao = DateTime.UtcNow.AddDays(-3)
            }
        };

        context.Chamados.AddRange(chamados);
        await context.SaveChangesAsync();

        // Cria algumas interações de teste
        var interacoes = new List<Interacao>
        {
            new Interacao
            {
                ChamadoId = chamados[1].ChamadoId,
                UsuarioId = usuarios[1].Id, // João
                Mensagem = "Olá! Vou verificar o problema de login para você.",
                DataCriacao = DateTime.UtcNow.AddHours(-2)
            },
            new Interacao
            {
                ChamadoId = chamados[1].ChamadoId,
                UsuarioId = usuarios[2].Id, // Maria
                Mensagem = "Obrigada! O problema persiste mesmo após reiniciar o navegador.",
                DataCriacao = DateTime.UtcNow.AddHours(-1)
            }
        };

        context.Interacoes.AddRange(interacoes);
        await context.SaveChangesAsync();
    }
}
