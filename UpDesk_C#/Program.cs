using System;
using System.Collections.Generic;

namespace UpDesk
{
    class Program
    {
        static void Main(string[] args)
        {
            ChamadoService chamadoService = new ChamadoService();

            Usuario usuarioLogado = new UsuarioComum(1, "Mateus", "mateus@email.com", "123");

            int opcao;

            do
            {
                Console.Clear();
                Console.WriteLine("=== UPDESK - SISTEMA DE CHAMADOS ===");
                Console.WriteLine("1 - Criar chamado");
                Console.WriteLine("2 - Listar chamados");
                Console.WriteLine("3 - Atualizar status de chamado");
                Console.WriteLine("4 - Adicionar interação");
                Console.WriteLine("5 - Ver detalhes do chamado");
                Console.WriteLine("0 - Sair");
                Console.Write("Escolha uma opção: ");
                opcao = int.Parse(Console.ReadLine());

                switch (opcao)
                {
                    case 1:
                        Console.Write("Título: ");
                        string titulo = Console.ReadLine();
                        Console.Write("Descrição: ");
                        string descricao = Console.ReadLine();

                        chamadoService.CriarChamado(titulo, descricao, usuarioLogado);
                        break;

                    case 2:
                        chamadoService.ListarChamados();
                        break;

                    case 3:
                        Console.Write("ID do chamado: ");
                        int idStatus = int.Parse(Console.ReadLine());
                        Console.Write("Novo status: ");
                        string novoStatus = Console.ReadLine();

                        chamadoService.AtualizarStatus(idStatus, novoStatus);
                        break;

                    case 4:
                        Console.Write("ID do chamado: ");
                        int idInteracao = int.Parse(Console.ReadLine());
                        Console.Write("Mensagem: ");
                        string mensagem = Console.ReadLine();

                        chamadoService.AdicionarInteracao(idInteracao, mensagem, usuarioLogado.Nome);
                        break;

                    case 5:
                        Console.Write("ID do chamado: ");
                        int idExibir = int.Parse(Console.ReadLine());
                        chamadoService.ExibirChamado(idExibir);
                        break;

                    case 0:
                        Console.WriteLine("Encerrando o sistema...");
                        break;

                    default:
                        Console.WriteLine("Opção inválida!");
                        break;
                }

                Console.WriteLine("\nPressione qualquer tecla para continuar...");
                Console.ReadKey();

            } while (opcao != 0);
        }
    }
}