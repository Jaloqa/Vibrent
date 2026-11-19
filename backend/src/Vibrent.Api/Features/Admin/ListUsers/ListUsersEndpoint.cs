using MediatR;
using Vibrent.Api.Common;
using Vibrent.Api.Common.Pagination;

namespace Vibrent.Api.Features.Admin.ListUsers;

internal static class ListUsersEndpoint
{
    public static RouteHandlerBuilder MapListUsers(this IEndpointRouteBuilder routes) => routes
        .MapGet("/users", async (
            ISender sender,
            CancellationToken cancellationToken,
            string? search,
            int page = PaginationExtensions.DefaultPage,
            int pageSize = PaginationExtensions.DefaultPageSize) =>
            Results.Ok(await sender.Send(new ListUsersQuery(search, page, pageSize), cancellationToken)))
        .WithName("ListUsers")
        .RequireAuthorization(AuthorizationPolicies.Admin)
        .Produces<PagedResponse<AdminUserResponse>>()
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden);
}
