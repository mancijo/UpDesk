using UpDesk;
using System;
using System.Collections.Generic;

class Program
{
    static void Main(string[] args)
    {
        
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
                    
                    Console.WriteLine("\nChamado criado com sucesso!");
                   
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
