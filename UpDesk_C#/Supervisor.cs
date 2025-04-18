using System;

namespace UpDesk
{
    class Supervisor : Usuario
    {
        public Supervisor(int id, string nome, string email, string senha)
            : base(id, nome, email, senha)
        {
        }

        public override string GetTipoUsuario()
        {
            return "Supervisor";
        }

        public override void ExibirPerfil()
        {
            Console.WriteLine("=== PERFIL DE SUPERVISOR ===");
            base.ExibirPerfil();
        }
    }
}