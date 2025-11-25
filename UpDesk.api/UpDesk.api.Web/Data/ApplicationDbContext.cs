using System.Collections.Generic;
using System.Reflection.Emit;
using Microsoft.EntityFrameworkCore;
using UpDesk.Api.Models;

namespace UpDesk.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Chamado> Chamados { get; set; }
    public DbSet<Interacao> Interacoes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuração para o duplo relacionamento entre Usuario e Chamado
        modelBuilder.Entity<Chamado>()
            .HasOne(c => c.Solicitante)
            .WithMany(u => u.ChamadosSolicitados)
            .HasForeignKey(c => c.SolicitanteId)
            .OnDelete(DeleteBehavior.Restrict); // Evita deleção em cascata

        modelBuilder.Entity<Chamado>()
            .HasOne(c => c.Atendente)
            .WithMany(u => u.ChamadosAtendidos)
            .HasForeignKey(c => c.AtendenteId)
            .OnDelete(DeleteBehavior.Restrict); // Evita deleção em cascata

        // Garante que o email do usuário seja único
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email)
            .IsUnique();
    }
}