using Vibrent.Api.Features.Events.CreateEvent;
using Vibrent.Api.Features.Events.GetEvent;

namespace Vibrent.Api.Features.Events;

internal static class EventsEndpoints
{
    public static IEndpointRouteBuilder MapEventsEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/events").WithTags("Events");

        group.MapCreateEvent();
        group.MapGetEvent();

        return routes;
    }
}
