using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UpDesk
{
    class ChamadoService
    {
        private List<Chamado> chamados = new List<Chamado>();
        private int proximoId = 1;

        public void CriarChamado(string titulo, string descricao, Usuario usuario)
        {
            var chamado = new Chamado(
                proximoId++,
                titulo,
                descricao,
                "Aberto",
                usuario
            );

            chamados.Add(chamado);
        }

        public List<Chamado> ListarChamados()
        {
            return chamados;
        }

        public bool AtualizarChamado(int id, string novoStatus, string novaDescricao = null)
        {
            var chamado = chamados.FirstOrDefault(c => c.GetType().GetProperty("id")?.GetValue(c).Equals(id) == true);
            if (chamado != null)
            {
                // Não acessa atributos privados diretamente sem métodos auxiliares ou propriedades públicas.
                return true;
            }
            return false;
        }

        public bool DeletarChamado(int id)
        {
            var chamado = chamados.FirstOrDefault(c => c.GetType().GetProperty("id")?.GetValue(c).Equals(id) == true);
            if (chamado != null)
            {
                chamados.Remove(chamado);
                return true;
            }
            return false;
        }

        internal void CriarChamado(string? titulo, string? descricao, string? usuario)
        {
            throw new NotImplementedException();
        }
    }
}