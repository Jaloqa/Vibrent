using Vibrent.Api.Features.Events.CreateEvent;

namespace Vibrent.Api.Features.Events;

internal static class EventsEndpoints
{
    public static IEndpointRouteBuilder MapEventsEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/events").WithTags("Events");

        group.MapCreateEvent();

        return routes;
    }
}
