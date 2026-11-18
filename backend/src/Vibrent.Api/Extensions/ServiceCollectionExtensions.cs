using FluentValidation;
using Vibrent.Api.Behaviors;
using Vibrent.Api.Middleware;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApi(this IServiceCollection services)
    {
        services.AddOpenApi();
        services.AddProblemDetails();
        services.AddExceptionHandler<GlobalExceptionHandler>();

        services.AddMediatR(config =>
        {
            config.RegisterServicesFromAssemblyContaining<Program>();
            config.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });
        services.AddValidatorsFromAssemblyContaining<Program>(includeInternalTypes: true);

        services.AddHealthChecks().AddDbContextCheck<AppDbContext>();

        return services;
    }
}
