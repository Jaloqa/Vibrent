using System.Security.Claims;
using MediatR;
using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Events.CancelEvent;

internal static class CancelEventEndpoint
{
    public static RouteHandlerBuilder MapCancelEvent(this IEndpointRouteBuilder routes) => routes
        .MapPost("/{eventId:guid}/cancel", async (
            Guid eventId,
            ClaimsPrincipal principal,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new CancelEventCommand(eventId, principal.GetUserId()), cancellationToken);

            return result.IsSuccess
                ? Results.NoContent()
                : result.Error!.ToProblem();
        })
        .WithName("CancelEvent")
        .RequireAuthorization(AuthorizationPolicies.User)
        .Produces(StatusCodes.Status204NoContent)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesProblem(StatusCodes.Status409Conflict);
}
