using Vibrent.Api.Features.Users.GetProfile;

namespace Vibrent.Api.Features.Users;

internal static class UsersEndpoints
{
    public static IEndpointRouteBuilder MapUsersEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/users").WithTags("Users");

        group.MapGetProfile();

        return routes;
    }
}
