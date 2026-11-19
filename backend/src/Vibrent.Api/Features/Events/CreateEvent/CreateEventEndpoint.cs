using System.Security.Claims;
using MediatR;
using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Events.CreateEvent;

internal static class CreateEventEndpoint
{
    public static RouteHandlerBuilder MapCreateEvent(this IEndpointRouteBuilder routes) => routes
        .MapPost("/", async (
            EventRequest request,
            ClaimsPrincipal principal,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var command = new CreateEventCommand(
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
                ? Results.Created($"/events/{result.Value.Id}", result.Value)
                : result.Error!.ToProblem();
        })
        .WithName("CreateEvent")
        .RequireAuthorization(AuthorizationPolicies.User)
        .Produces<EventResponse>(StatusCodes.Status201Created)
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status401Unauthorized);
}
