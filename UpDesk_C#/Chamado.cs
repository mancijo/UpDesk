using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UpDesk
{
    class Chamado
    {
        public int Id { get; set; }
        public string Titulo { get; set; }
        public string Descricao { get; set; }
        public string Status { get; set; }
        public string Usuario { get; set; }
        public object chamados { get; private set; }

        public void CriarChamado(string titulo, string descricao, string usuario)
        {
            int proximoId = 0;
            var chamado = new Chamado
            {
                Id = proximoId++,
                Titulo = titulo,
                Descricao = descricao,
                Status = "Aberto",
                Usuario = usuario,

            };
        }
    }
}
