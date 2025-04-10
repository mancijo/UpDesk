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

        public void CriarChamado(string titulo, string descricao, string usuario)
        {
            var chamado = new Chamado
            {
                Id = proximoId++,
                Titulo = titulo,
                Descricao = descricao,
                Status = "Aberto",
                Usuario = usuario,
            };
            chamados.Add(chamado);
        }
        public bool DeletarChamado(int id)
        {
            var chamado = chamados.FirstOrDefault(c => c.Id == id);
            if (chamado != null)
            {
                chamados.Remove(chamado);
                return true;
            }
            return false;
        }

        public bool AtualizarChamado(int id, string novoStatus, string novaDescricao = null)
        {
            var chamado = chamados.FirstOrDefault(c => c.Id == id);
            if (chamado != null)
            {
                chamado.Status = novoStatus;
                if (!string.IsNullOrEmpty(novaDescricao))
                    chamado.Descricao = novaDescricao;
                return true;
            }
            return false;
        }

        public List<Chamado> ListarChamados()
        {
            return chamados;
        }
    }
}
