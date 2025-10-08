using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UpDesk.api.Web.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Usuario",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Telefone = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    Setor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Cargo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Senha = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuario", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Chamado",
                columns: table => new
                {
                    chamado_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AtendenteId = table.Column<int>(type: "int", nullable: true),
                    SolicitanteId = table.Column<int>(type: "int", nullable: true),
                    titulo_Chamado = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    descricao_Chamado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    categoria_Chamado = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    prioridade_Chamado = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    status_Chamado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataAbertura = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataUltimaModificacao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SolucaoSugerida = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SolucaoAplicada = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Chamado", x => x.chamado_ID);
                    table.ForeignKey(
                        name: "FK_Chamado_Usuario_AtendenteId",
                        column: x => x.AtendenteId,
                        principalTable: "Usuario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Chamado_Usuario_SolicitanteId",
                        column: x => x.SolicitanteId,
                        principalTable: "Usuario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Interacoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChamadoId = table.Column<int>(type: "int", nullable: false),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    Mensagem = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Interacoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Interacoes_Chamado_ChamadoId",
                        column: x => x.ChamadoId,
                        principalTable: "Chamado",
                        principalColumn: "chamado_ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Interacoes_Usuario_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Chamado_AtendenteId",
                table: "Chamado",
                column: "AtendenteId");

            migrationBuilder.CreateIndex(
                name: "IX_Chamado_SolicitanteId",
                table: "Chamado",
                column: "SolicitanteId");

            migrationBuilder.CreateIndex(
                name: "IX_Interacoes_ChamadoId",
                table: "Interacoes",
                column: "ChamadoId");

            migrationBuilder.CreateIndex(
                name: "IX_Interacoes_UsuarioId",
                table: "Interacoes",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuario_Email",
                table: "Usuario",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Interacoes");

            migrationBuilder.DropTable(
                name: "Chamado");

            migrationBuilder.DropTable(
                name: "Usuario");
        }
    }
}
