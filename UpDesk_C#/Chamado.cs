using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;
using System.ComponentModel.DataAnnotations;

namespace UpDesk
{
    class Chamado 
    {
        private int Id {  get; set; }
        private string Titulo { get; set; }
        private string Descricao { get; set; }
        private string Status { get; set; }
        private string Usuario { get; set; }

        private List<Chamado> chamados = new List<Chamado>();

        public Chamado(int id, string titulo, string descricao, string usuario, String status)
        {
            this.Titulo = titulo;
            this.Descricao = descricao;       
            this.Usuario = usuario;
            this.Status = status;
            this.Id = id;
        }

        public List<Chamado> lista = new List<Chamado>();
       
        

        

        public void ExibirDetalhes()
        {
            Console.WriteLine($"ID: {Id}");
            Console.WriteLine($"Título: {Titulo}");
            Console.WriteLine($"Descrição: {Descricao}");
            Console.WriteLine($"Status: {Status}");
            
            
        }

       
    }
}