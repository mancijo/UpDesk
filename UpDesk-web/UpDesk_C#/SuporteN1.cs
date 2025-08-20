using System;

namespace UpDesk
{
    class SuporteN1 : Usuario
    {
        public SuporteN1(int id, string nome, string email, string senha)
            : base(id, nome, email, senha)
        {
        }

        public override string GetTipoUsuario()
        {
            return "Suporte N1";
        }
    }
}