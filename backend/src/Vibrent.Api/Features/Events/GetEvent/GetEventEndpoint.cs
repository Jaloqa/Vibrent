using MediatR;
using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Events.GetEvent;

internal static class GetEventEndpoint
{
    public static RouteHandlerBuilder MapGetEvent(this IEndpointRouteBuilder routes) => routes
        .MapGet("/{eventId:guid}", async (Guid eventId, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new GetEventQuery(eventId), cancellationToken);

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : result.Error!.ToProblem();
        })
        .WithName("GetEvent")
        .RequireAuthorization(AuthorizationPolicies.User)
        .Produces<EventResponse>()
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound);
}
