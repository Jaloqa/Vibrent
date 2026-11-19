using Vibrent.Api.Features.Auth.Register;

namespace Vibrent.Api.Features.Auth;

internal static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/auth").WithTags("Auth");

        group.MapRegister();

        return routes;
    }
}
