using Serilog;
using Vibrent.Api.Extensions;
using Vibrent.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSerilog((services, logger) => logger
    .ReadFrom.Configuration(builder.Configuration)
    .ReadFrom.Services(services));

builder.Services.AddApi();
builder.Services.AddInfrastructure();

var app = builder.Build();

app.UseApi();

app.Run();
