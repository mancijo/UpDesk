using System;

namespace UpDesk
{
    class SuporteN2 : Usuario
    {
        public SuporteN2(int id, string nome, string email, string senha)
            : base(id, nome, email, senha)
        {
        }

        public override string GetTipoUsuario()
        {
            return "Suporte N2";
        }
    }
}