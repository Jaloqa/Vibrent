FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY global.json Directory.Build.props Directory.Packages.props ./
COPY src/Vibrent.Api/Vibrent.Api.csproj src/Vibrent.Api/
COPY src/Vibrent.Domain/Vibrent.Domain.csproj src/Vibrent.Domain/
COPY src/Vibrent.Infrastructure/Vibrent.Infrastructure.csproj src/Vibrent.Infrastructure/
RUN dotnet restore src/Vibrent.Api/Vibrent.Api.csproj

COPY src/ src/
RUN dotnet publish src/Vibrent.Api/Vibrent.Api.csproj --configuration Release --no-restore --output /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
USER $APP_UID
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Vibrent.Api.dll"]
