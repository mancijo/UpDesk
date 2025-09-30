using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UpDesk.Api.Models;

[Table("Interacoes")]
public class Interacao
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ChamadoId { get; set; }

    [Required]
    public int UsuarioId { get; set; }

    [Required]
    public string Mensagem { get; set; }

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    // Relações de Navegação
    [ForeignKey("ChamadoId")]
    public virtual Chamado Chamado { get; set; }

    [ForeignKey("UsuarioId")]
    public virtual Usuario Usuario { get; set; }
}