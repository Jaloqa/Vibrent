using Serilog;
using Vibrent.Api.Extensions;
using Vibrent.Api.Features.Auth;
using Vibrent.Api.Features.Users;
using Vibrent.Infrastructure;
using Vibrent.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSerilog((services, logger) => logger
    .ReadFrom.Configuration(builder.Configuration)
    .ReadFrom.Services(services));

builder.Services.AddApi();
builder.Services.AddInfrastructure();

var app = builder.Build();

if (app.Configuration.GetValue<bool>("Database:MigrateOnStartup"))
{
    await app.Services.MigrateDatabaseAsync();
}

app.UseApi();

app.MapAuthEndpoints();
app.MapUsersEndpoints();

await app.RunAsync();
