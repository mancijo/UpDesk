// Local do arquivo: UpDesk.Api/Program.cs

using Microsoft.EntityFrameworkCore;
using UpDesk.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// --- IN�CIO DA ADI��O DO CORS ---
var myAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: myAllowSpecificOrigins,
                      policy =>
                      {
                          // Permite qualquer origem, cabeçalho e método, ideal para desenvolvimento local
                        policy.AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                      });
});
// --- FIM DA ADI��O DO CORS ---


// Configura��o do Banco de Dados
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseDefaultFiles(); // Esta linha faz o servidor encontrar o index.html por defeito
app.UseStaticFiles();  // Esta linha permite que o servidor sirva o index.html e outros ficheiros (CSS, JS)

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(myAllowSpecificOrigins); // Habilita a pol�tica de CORS

app.UseAuthorization();
app.MapControllers();
app.Run();