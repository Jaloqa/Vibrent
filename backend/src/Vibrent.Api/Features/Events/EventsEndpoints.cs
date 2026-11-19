using Vibrent.Api.Features.Events.CancelEvent;
using Vibrent.Api.Features.Events.CreateEvent;
using Vibrent.Api.Features.Events.DeleteEvent;
using Vibrent.Api.Features.Events.GetEvent;
using Vibrent.Api.Features.Events.UpdateEvent;

namespace Vibrent.Api.Features.Events;

internal static class EventsEndpoints
{
    public static IEndpointRouteBuilder MapEventsEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/events").WithTags("Events");

        group.MapCreateEvent();
        group.MapGetEvent();
        group.MapUpdateEvent();
        group.MapCancelEvent();
        group.MapDeleteEvent();

        return routes;
    }
}
