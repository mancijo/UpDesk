// Local do arquivo: UpDesk.Api/Program.cs

using Microsoft.EntityFrameworkCore;
using UpDesk.Api.Data;
using UpDesk.Api.Middleware;
using UpDesk.Api.Services;

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

// Registra o serviço JWT
builder.Services.AddScoped<JwtService>();

// Registra o serviço de IA (usando mock temporariamente)
builder.Services.AddScoped<IaiService, MockIaService>();
// builder.Services.AddHttpClient<IaiService, GeminiIaService>(); // Descomente quando quiser usar a API real

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

// Executa o seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await SeedData.SeedAsync(context);
}

app.Run();