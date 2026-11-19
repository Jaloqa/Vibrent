using Vibrent.Api.Features.Admin.BlockUser;
using Vibrent.Api.Features.Admin.ListUsers;

namespace Vibrent.Api.Features.Admin;

internal static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/admin").WithTags("Admin");

        group.MapListUsers();
        group.MapBlockUser();

        return routes;
    }
}
