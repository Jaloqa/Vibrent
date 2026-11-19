using System.Security.Claims;
using MediatR;
using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Feed.GetFeed;

internal static class GetFeedEndpoint
{
    public static RouteHandlerBuilder MapGetFeed(this IEndpointRouteBuilder routes) => routes
        .MapGet("/feed", async (
            ClaimsPrincipal principal,
            ISender sender,
            CancellationToken cancellationToken,
            double? lat,
            double? lng,
            double? radiusKm,
            Guid? categoryId,
            string? cursor,
            int limit = GetFeedQuery.DefaultLimit) =>
        {
            var query = new GetFeedQuery(principal.GetUserId(), lat, lng, radiusKm, categoryId, cursor, limit);

            return Results.Ok(await sender.Send(query, cancellationToken));
        })
        .WithName("GetFeed")
        .RequireAuthorization(AuthorizationPolicies.User)
        .Produces<FeedPageResponse>()
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status401Unauthorized);
}
