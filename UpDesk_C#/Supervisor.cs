using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UpDesk
{
    class Supervisor: Usuario
    {
        public Supervisor(string login, string senha) : base(login, senha)
        {
        }
    }
}
