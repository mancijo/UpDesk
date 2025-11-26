// Local do arquivo: UpDesk.Api/Program.cs

using Microsoft.EntityFrameworkCore;
using UpDesk.Api.Data;
using UpDesk.Api.Middleware;
using UpDesk.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- IN�CIO DA ADIcaO DO CORS ---
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
// --- FIM DA ADIcaO DO CORS ---


// Configura��o do Banco de Dados
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString, sqlOptions =>
        sqlOptions.EnableRetryOnFailure() // Habilita retry para falhas transitórias (recomendado em cloud)
    ));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Registra HttpClient factory para injeção em serviços que fazem chamadas HTTP externas
builder.Services.AddHttpClient();

// Registra o serviço JWT
builder.Services.AddScoped<JwtService>();

// Configura autenticação JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? "UpDesk_Secret_Key_Minimum_32_Characters_Long";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "UpDesk";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "UpDesk";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
        // Permitir tokens enviados via query string in development if needed (optional)
        // options.Events = new JwtBearerEvents { OnMessageReceived = context => { ... } };
    });

// Registra o serviço de IA (usando mock temporariamente)
// Se quiser usar o mock, descomente a linha abaixo e comente o registro do GeminiIaService
// builder.Services.AddScoped<IaiService, MockIaService>();

// Registra a implementação da IA dependendo da configuração
var geminiApiKey = builder.Configuration["Gemini:ApiKey"];
if (!string.IsNullOrWhiteSpace(geminiApiKey))
{
    // Se existir chave configurada, registra o serviço real
    builder.Services.AddScoped<IaiService, GeminiIaService>();
}
else
{
    // Caso não exista chave (ex.: ambiente de desenvolvimento), usa o mock para evitar falhas na ativação
    builder.Services.AddScoped<IaiService, MockIaService>();
}

var app = builder.Build();
app.UseDefaultFiles(); // Esta linha faz o servidor encontrar o index.html por defeito
app.UseStaticFiles();  // Esta linha permite que o servidor sirva o index.html e outros ficheiros (CSS, JS)

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(myAllowSpecificOrigins); // Habilita a politica de CORS
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Executa o seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await SeedData.SeedAsync(context);
}

app.Run();