FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia tudo e restaura apenas o projeto de AppHost (melhora cache)
COPY . .
RUN dotnet restore ./UpDesk.api.AppHost/UpDesk.api.AppHost.csproj
RUN dotnet publish ./UpDesk.api.AppHost/UpDesk.api.AppHost.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS="http://+:80"
EXPOSE 80

ENTRYPOINT ["dotnet", "UpDesk.api.AppHost.dll"]
