using System.Security.Claims;
using MediatR;
using Vibrent.Api.Common;
using Vibrent.Domain.Swipes;

namespace Vibrent.Api.Features.Swipes.SwipeEvent;

internal static class SwipeEventEndpoint
{
    public static RouteHandlerBuilder MapSwipeEvent(this IEndpointRouteBuilder routes) => routes
        .MapPost("/{eventId:guid}/swipe", async (
            Guid eventId,
            SwipeRequest request,
            ClaimsPrincipal principal,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new SwipeEventCommand(eventId, principal.GetUserId(), request.Decision), cancellationToken);

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : result.Error!.ToProblem();
        })
        .WithName("SwipeEvent")
        .RequireAuthorization(AuthorizationPolicies.User)
        .Produces<SwipeResponse>()
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesProblem(StatusCodes.Status409Conflict);

    public sealed record SwipeRequest(SwipeDecision Decision);
}
