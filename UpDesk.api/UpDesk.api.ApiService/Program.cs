var builder = WebApplication.CreateBuilder(args);

// Add service defaults & Aspire client integrations.
builder.AddServiceDefaults();

// Add services to the container.
builder.Services.AddProblemDetails();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

app.MapGet("/", () =>
{
    // Endpoint de teste para verificar se a API está no ar.
    return Results.Ok(new { message = "API C# está funcionando!" });
})
.WithName("GetRoot");

app.MapDefaultEndpoints();

app.Run();
