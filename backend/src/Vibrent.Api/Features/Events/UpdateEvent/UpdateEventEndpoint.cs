using System.Security.Claims;
using MediatR;
using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Events.UpdateEvent;

internal static class UpdateEventEndpoint
{
    public static RouteHandlerBuilder MapUpdateEvent(this IEndpointRouteBuilder routes) => routes
        .MapPut("/{eventId:guid}", async (
            Guid eventId,
            EventRequest request,
            ClaimsPrincipal principal,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var command = new UpdateEventCommand(
                eventId,
                principal.GetUserId(),
                request.CategoryId,
                request.Title,
                request.Description,
                request.StartsAt,
                request.Address,
                request.Latitude,
                request.Longitude,
                request.Capacity);
            var result = await sender.Send(command, cancellationToken);

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : result.Error!.ToProblem();
        })
        .WithName("UpdateEvent")
        .RequireAuthorization(AuthorizationPolicies.User)
        .Produces<EventResponse>()
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesProblem(StatusCodes.Status409Conflict);
}
