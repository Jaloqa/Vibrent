using System.Security.Claims;
using MediatR;
using Vibrent.Api.Common;
using Vibrent.Api.Common.Pagination;

namespace Vibrent.Api.Features.Events.ListMyEvents;

internal static class ListMyEventsEndpoint
{
    public static RouteHandlerBuilder MapListMyEvents(this IEndpointRouteBuilder routes) => routes
        .MapGet("/mine", async (
            ClaimsPrincipal principal,
            ISender sender,
            CancellationToken cancellationToken,
            int page = PaginationExtensions.DefaultPage,
            int pageSize = PaginationExtensions.DefaultPageSize) =>
            Results.Ok(await sender.Send(new ListMyEventsQuery(principal.GetUserId(), page, pageSize), cancellationToken)))
        .WithName("ListMyEvents")
        .RequireAuthorization(AuthorizationPolicies.User)
        .Produces<PagedResponse<MyEventResponse>>()
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status401Unauthorized);
}
