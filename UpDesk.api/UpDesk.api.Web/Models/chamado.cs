using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UpDesk.Api.Models;

[Table("Chamado")]
public class Chamado
{
    [Key]
    [Column("chamado_ID")] // Mapeia para o nome da coluna exata no Python
    public int ChamadoId { get; set; }

    public int? AtendenteId { get; set; }

    public int? SolicitanteId { get; set; }

    [Required, MaxLength(255)]
    [Column("titulo_Chamado")]
    public string TituloChamado { get; set; }

    [Required]
    [Column("descricao_Chamado")]
    public string DescricaoChamado { get; set; }

    [Required, MaxLength(100)]
    [Column("categoria_Chamado")]
    public string CategoriaChamado { get; set; }

    [Required, MaxLength(15)]
    [Column("prioridade_Chamado")]
    public string PrioridadeChamado { get; set; }

    [Column("status_Chamado")]
    public string StatusChamado { get; set; } = "Aberto";

    public DateTime DataAbertura { get; set; } = DateTime.UtcNow;

    public DateTime? DataUltimaModificacao { get; set; }

    public string? SolucaoSugerida { get; set; }

    public string? SolucaoAplicada { get; set; }

    // Relações de Navegação
    [ForeignKey("SolicitanteId")]
    public virtual Usuario? Solicitante { get; set; }

    [ForeignKey("AtendenteId")]
    public virtual Usuario? Atendente { get; set; }

    public virtual ICollection<Interacao> Interacoes { get; set; } = new List<Interacao>();
}