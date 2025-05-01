using System;

namespace UpDesk
{
    class UsuarioComum : Usuario
    {
        public UsuarioComum(int id, string nome, string email, string senha)
            : base(id, nome, email, senha)
        {
        }

        public override string GetTipoUsuario()
        {
            return "Comum";
        }
    }
}