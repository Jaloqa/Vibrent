using Vibrent.Api.Features.Auth.ChangePassword;
using Vibrent.Api.Features.Auth.Login;
using Vibrent.Api.Features.Auth.Register;

namespace Vibrent.Api.Features.Auth;

internal static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/auth").WithTags("Auth");

        group.MapRegister();
        group.MapLogin();
        group.MapChangePassword();

        return routes;
    }
}
