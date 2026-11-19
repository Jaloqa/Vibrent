using System.Security.Claims;
using MediatR;
using Vibrent.Api.Common;
using Vibrent.Api.Common.Pagination;
using Vibrent.Domain.Applications;

namespace Vibrent.Api.Features.Applications.ListEventApplications;

internal static class ListEventApplicationsEndpoint
{
    public static RouteHandlerBuilder MapListEventApplications(this IEndpointRouteBuilder routes) => routes
        .MapGet("/{eventId:guid}/applications", async (
            Guid eventId,
            ClaimsPrincipal principal,
            ISender sender,
            CancellationToken cancellationToken,
            ApplicationStatus? status,
            int page = PaginationExtensions.DefaultPage,
            int pageSize = PaginationExtensions.DefaultPageSize) =>
        {
            var query = new ListEventApplicationsQuery(eventId, principal.GetUserId(), status, page, pageSize);
            var result = await sender.Send(query, cancellationToken);

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : result.Error!.ToProblem();
        })
        .WithName("ListEventApplications")
        .RequireAuthorization(AuthorizationPolicies.User)
        .Produces<PagedResponse<EventApplicationResponse>>()
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound);
}
