using System.Text.Json.Serialization;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Vibrent.Api.Behaviors;
using Vibrent.Api.Common;
using Vibrent.Api.Middleware;
using Vibrent.Domain.Users;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApi(this IServiceCollection services)
    {
        services.AddOpenApi();
        services.ConfigureHttpJsonOptions(options =>
            options.SerializerOptions.Converters.Add(new JsonStringEnumConverter(namingPolicy: null, allowIntegerValues: false)));
        services.AddProblemDetails();
        services.AddExceptionHandler<GlobalExceptionHandler>();

        services.AddMediatR(config =>
        {
            config.RegisterServicesFromAssemblyContaining<Program>();
            config.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });
        services.AddValidatorsFromAssemblyContaining<Program>(includeInternalTypes: true);

        services.AddHealthChecks().AddDbContextCheck<AppDbContext>();

        services.AddScoped<IAuthorizationHandler, ActiveUserHandler>();
        services.AddAuthorizationBuilder()
            .AddPolicy(AuthorizationPolicies.User, policy => policy
                .RequireAuthenticatedUser()
                .AddRequirements(new ActiveUserRequirement()))
            .AddPolicy(AuthorizationPolicies.Admin, policy => policy
                .RequireAuthenticatedUser()
                .RequireRole(nameof(UserRole.Admin))
                .AddRequirements(new ActiveUserRequirement()))
            .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build());

        return services;
    }
}
