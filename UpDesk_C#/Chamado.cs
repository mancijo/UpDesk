using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UpDesk
{
    class Chamado
    {
        internal object Id;
        internal object Titulo;
        internal object Descricao;
        internal object Status;
        internal object Usuario;
        private int id;
        private string titulo;
        private string descricao;
        private string status;
        private Usuario usuario;

        public Chamado(int v1, string titulo, string descricao, string v2, Usuario usuario)
        {
            V1 = v1;
            this.titulo = titulo;
            this.descricao = descricao;
            V2 = v2;
            this.usuario = usuario;
        }

        public Chamado(int id, string titulo, string descricao, string status, Usuario usuario, string solucaoIA)
        {
            this.id = id;
            this.titulo = titulo;
            this.descricao = descricao;
            this.status = status;
            this.usuario = usuario;
            
        }

        public int V1 { get; }
        public string V2 { get; }

        public void ExibirDetalhes()
        {
            Console.WriteLine($"ID: {id}");
            Console.WriteLine($"Título: {titulo}");
            Console.WriteLine($"Descrição: {descricao}");
            Console.WriteLine($"Status: {status}");
            Console.WriteLine($"Usuário: {usuario.TipoUsuario}");
            
        }
    }
}
