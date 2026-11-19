using MediatR;
using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Admin.ModerateEvent;

internal static class ModerateEventEndpoint
{
    public static RouteHandlerBuilder MapModerateEvent(this IEndpointRouteBuilder routes) => routes
        .MapPost("/events/{eventId:guid}/cancel", async (Guid eventId, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new ModerateEventCommand(eventId), cancellationToken);

            return result.IsSuccess
                ? Results.NoContent()
                : result.Error!.ToProblem();
        })
        .WithName("ModerateCancelEvent")
        .RequireAuthorization(AuthorizationPolicies.Admin)
        .Produces(StatusCodes.Status204NoContent)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesProblem(StatusCodes.Status409Conflict);
}
