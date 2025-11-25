var builder = DistributedApplication.CreateBuilder(args);

var apiService = builder.AddProject<Projects.UpDesk_api_ApiService>("apiservice");

builder.AddProject<Projects.UpDesk_api_Web>("webfrontend")
    .WithExternalHttpEndpoints()
    .WithReference(apiService)
    .WaitFor(apiService);

builder.Build().Run();
