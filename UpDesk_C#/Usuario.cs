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
        private string Login { get; set; }
        private string Senha { get; set; }

        public Usuario(string login, string senha)
        {
            Login = login;
            Senha = senha;
        }

    }
}
