using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UpDesk
{
    class UsuarioComum : Usuario
    {
        public UsuarioComum(int id, string nome, string email, string senha)
            : base(id, nome, email, senha) { }

        public override string TipoUsuario => "Comum";
    }
}
