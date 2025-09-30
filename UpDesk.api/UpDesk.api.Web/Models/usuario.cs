using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UpDesk.Api.Models;

[Table("Usuario")]
public class Usuario
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Nome { get; set; }

    [Required, MaxLength(255)]
    public string Email { get; set; }

    [MaxLength(15)]
    public string? Telefone { get; set; }

    [MaxLength(50)]
    public string? Setor { get; set; }

    [Required, MaxLength(50)]
    public string Cargo { get; set; }

    [Required]
    public string Senha { get; set; }

    public bool Ativo { get; set; } = true;

    // Relacionamentos
    [InverseProperty("Solicitante")]
    public virtual ICollection<Chamado> ChamadosSolicitados { get; set; } = new List<Chamado>();

    [InverseProperty("Atendente")]
    public virtual ICollection<Chamado> ChamadosAtendidos { get; set; } = new List<Chamado>();
}