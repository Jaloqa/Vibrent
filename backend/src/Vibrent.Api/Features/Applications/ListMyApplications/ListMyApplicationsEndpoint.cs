using System.Security.Claims;
using MediatR;
using Vibrent.Api.Common;
using Vibrent.Api.Common.Pagination;
using Vibrent.Domain.Applications;

namespace Vibrent.Api.Features.Applications.ListMyApplications;

internal static class ListMyApplicationsEndpoint
{
    public static RouteHandlerBuilder MapListMyApplications(this IEndpointRouteBuilder routes) => routes
        .MapGet("/mine", async (
            ClaimsPrincipal principal,
            ISender sender,
            CancellationToken cancellationToken,
            ApplicationStatus? status,
            int page = PaginationExtensions.DefaultPage,
            int pageSize = PaginationExtensions.DefaultPageSize) =>
        {
            var query = new ListMyApplicationsQuery(principal.GetUserId(), status, page, pageSize);

            return Results.Ok(await sender.Send(query, cancellationToken));
        })
        .WithName("ListMyApplications")
        .RequireAuthorization(AuthorizationPolicies.User)
        .Produces<PagedResponse<MyApplicationResponse>>()
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status401Unauthorized);
}
