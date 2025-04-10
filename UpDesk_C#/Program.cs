using UpDesk;
using System;

class Program
{
    static void Main(string[] args)
    {
        ChamadoService service = new ChamadoService();
        int opcao;

        do
        {
            Console.Clear();
            Console.WriteLine("=== Sistema de Gerenciamento de Chamados ===");
            Console.WriteLine("1 - Criar chamado");
            Console.WriteLine("2 - Listar chamados");
            Console.WriteLine("3 - Atualizar chamado");
            Console.WriteLine("4 - Deletar chamado");
            Console.WriteLine("0 - Sair");
            Console.Write("Escolha uma opção: ");

            if (!int.TryParse(Console.ReadLine(), out opcao)) continue;

            Console.Clear();

            switch (opcao)
            {
                case 1:
                    Console.Write("Título do chamado: ");
                    string titulo = Console.ReadLine();
                    Console.Write("Descrição do problema: ");
                    string descricao = Console.ReadLine();
                    Console.Write("Nome do usuário: ");
                    service.CriarChamado(titulo, descricao, Console.ReadLine());
                    Console.WriteLine("\nChamado criado com sucesso!");
                    break;

                case 2:
                    Console.WriteLine("=== Lista de Chamados ===");
                    var chamados = service.ListarChamados();
                    if (chamados.Count == 0)
                    {
                        Console.WriteLine("Nenhum chamado registrado.");
                    }
                    else
                    {
                        foreach (var chamado in chamados)
                        {
                            Console.WriteLine($"\nID: {chamado.Id}");
                            Console.WriteLine($"Título: {chamado.Titulo}");
                            Console.WriteLine($"Descrição: {chamado.Descricao}");
                            Console.WriteLine($"Status: {chamado.Status}");
                            Console.WriteLine($"Usuário: {chamado.Usuario}");
                            Console.WriteLine("----------------------------------------");
                        }
                    }
                    break;

                case 3:
                    Console.Write("Digite o ID do chamado a atualizar: ");
                    int idAtualizar = int.Parse(Console.ReadLine());
                    Console.Write("Novo status: ");
                    string novoStatus = Console.ReadLine();
                    Console.Write("Deseja alterar a descrição? (s/n): ");
                    string alterarDesc = Console.ReadLine().ToLower();
                    string novaDescricao = null;

                    if (alterarDesc == "s")
                    {
                        Console.Write("Nova descrição: ");
                        novaDescricao = Console.ReadLine();
                    }

                    bool atualizado = service.AtualizarChamado(idAtualizar, novoStatus, novaDescricao);
                    Console.WriteLine(atualizado ? "\nChamado atualizado com sucesso!" : "\nChamado não encontrado.");
                    break;

                case 4:
                    Console.Write("Digite o ID do chamado a excluir: ");
                    int idDeletar = int.Parse(Console.ReadLine());
                    bool deletado = service.DeletarChamado(idDeletar);
                    Console.WriteLine(deletado ? "\nChamado removido com sucesso!" : "\nChamado não encontrado.");
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
