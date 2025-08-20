using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UpDesk
{
    class Usuario
    {
        public int Id { get; private set; }
        public string Nome { get; private set; }
        public string Email { get; private set; }
        public string Senha { get; private set; }

        public Usuario(int id, string nome, string email, string senha)
        {
            Id = id;
            Nome = nome;
            Email = email;
            Senha = senha;
        }


        public virtual string GetTipoUsuario()
        {
            return "Comum";
        }

        public virtual void ExibirPerfil ()
        {
            Console.WriteLine($"ID: {Id}");
            Console.WriteLine($"Nome: {Nome}");
            Console.WriteLine($"Email: {Email}");
            Console.WriteLine($"Tipo: {GetTipoUsuario()}");
        }

        
    }   
}
