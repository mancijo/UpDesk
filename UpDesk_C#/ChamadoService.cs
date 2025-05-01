using System;
using System.Collections.Generic;
using System.Linq;
using static UpDesk.Chamado;

namespace UpDesk
{
    class ChamadoService
    {
        private List<Chamado> chamados;
        private int proximoId;

        public ChamadoService()
        {
            chamados = new List<Chamado>();
            proximoId = 1;
        }

        public void CriarChamado(string titulo, string descricao, Usuario usuario)
        {
            var chamado = new Chamado(proximoId, titulo, descricao, usuario);
            chamados.Add(chamado);
            proximoId++;

            Console.WriteLine("\nChamado criado com sucesso!");
        }

        public void ListarChamados()
        {
            if (chamados.Count == 0)
            {
                Console.WriteLine("Nenhum chamado encontrado.");
                return;
            }

            foreach (var chamado in chamados)
            {
                object detalhesChamado = chamado.ExibirDetalhes();
                Console.WriteLine("------------------------------");
            }
        }

        public bool AtualizarStatus(int id, string novoStatus)
        {
            var chamado = chamados.FirstOrDefault(c => c.Id == id);

            if (chamado != null)
            {
                chamado.AtualizarStatus(novoStatus);
                Console.WriteLine("Status atualizado com sucesso.");
                return true;
            }

            Console.WriteLine("Chamado não encontrado.");
            return false;
        }

        public bool RemoverChamado(int id)
        {
            var chamado = chamados.FirstOrDefault(c => c.Id == id);

            if (chamado != null)
            {
                chamados.Remove(chamado);
                Console.WriteLine("Chamado removido com sucesso.");
                return true;
            }

            Console.WriteLine("Chamado não encontrado.");
            return false;
        }

        public void AdicionarInteracao(int id, string mensagem, string nomeUsuario)
        {
            var chamado = chamados.FirstOrDefault(c => c.Id == id);
            if (chamado != null)
            {
                chamado.AdicionarInteracao(mensagem, nomeUsuario);
                Console.WriteLine("Interação adicionada.");
            }
            else
            {
                Console.WriteLine("Chamado não encontrado.");
            }
        }

        public void ExibirChamado(int id)
        {
            var chamado = chamados.FirstOrDefault(c => c.Id == id);
            if (chamado != null)
            {
                chamado.Exibir();
            }
            else
            {
                Console.WriteLine("Chamado não encontrado.");
            }
        }
    }

}
