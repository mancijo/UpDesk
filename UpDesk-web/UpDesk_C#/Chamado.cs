using System;
using System.Collections.Generic;

namespace UpDesk
{
    class Chamado
    {
        public int Id { get; private set; }
        public string Titulo { get; private set; }
        public string Descricao { get; private set; }
        public string Status { get; private set; }
        public Usuario Solicitante { get; private set; }
        private List<Interacao> interacoes;

        public Chamado(int id, string titulo, string descricao, Usuario solicitante)
        {
            Id = id;
            Titulo = titulo;
            Descricao = descricao;
            Solicitante = solicitante;
            Status = "Aberto";
            interacoes = new List<Interacao>();
        }

        public void AtualizarStatus(string novoStatus)
        {
            Status = novoStatus;
        }

        public void AdicionarInteracao(string mensagem, string nomeUsuario)
        {
            interacoes.Add(new Interacao(mensagem, nomeUsuario));
        }

        public void Exibir()
        {
            Console.WriteLine($"ID: {Id}");
            Console.WriteLine($"Título: {Titulo}");
            Console.WriteLine($"Descrição: {Descricao}");
            Console.WriteLine($"Status: {Status}");
            Console.WriteLine($"Solicitante: {Solicitante.Nome}");

            if (interacoes.Count > 0)
            {
                Console.WriteLine("\nInterações:");
                foreach (var interacao in interacoes)
                {
                    interacao.Exibir();
                }
            }
            else
            {
                Console.WriteLine("Nenhuma interação registrada.");
            }
        }



            public string ExibirDetalhes()
            {
               return $"ID: {Id}, Título: {Titulo}, Descrição: {Descricao}, Status: {Status}, Solicitante: {Solicitante.Nome}";
            }
    }
}
