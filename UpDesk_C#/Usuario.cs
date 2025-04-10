using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UpDesk
{
    class Usuario
    {
        private int Id { get; set; }
        private string Nome { get; set; }
        private string Email { get; set; }
        private string Senha { get; set; }

        public Usuario(int id, string nome, string Email, string senha)
        {
            id = id;
            nome = nome;
            Email = Email;
            senha = senha;
        }

        public virtual string TipoUsuario => "Comum";

        
    }   
}
