using System;

namespace UpDesk
{
    class Interacao
    {
        public string Mensagem { get; private set; }
        public DateTime DataHora { get; private set; }
        public string NomeUsuario { get; private set; }

        public Interacao(string mensagem, string nomeUsuario)
        {
            Mensagem = mensagem;
            NomeUsuario = nomeUsuario;
            DataHora = DateTime.Now;
        }

        public void Exibir()
        {
            Console.WriteLine($"[{DataHora}] {NomeUsuario}: {Mensagem}");
        }
    }
}