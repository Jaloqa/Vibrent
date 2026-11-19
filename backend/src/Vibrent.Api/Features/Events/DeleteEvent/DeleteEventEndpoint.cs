using System.Security.Claims;
using MediatR;
using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Events.DeleteEvent;

internal static class DeleteEventEndpoint
{
    public static RouteHandlerBuilder MapDeleteEvent(this IEndpointRouteBuilder routes) => routes
        .MapDelete("/{eventId:guid}", async (
            Guid eventId,
            ClaimsPrincipal principal,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new DeleteEventCommand(eventId, principal.GetUserId()), cancellationToken);

            return result.IsSuccess
                ? Results.NoContent()
                : result.Error!.ToProblem();
        })
        .WithName("DeleteEvent")
        .RequireAuthorization(AuthorizationPolicies.User)
        .Produces(StatusCodes.Status204NoContent)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesProblem(StatusCodes.Status409Conflict);
}
