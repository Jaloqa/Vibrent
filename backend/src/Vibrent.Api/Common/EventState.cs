using Vibrent.Domain.Events;

namespace Vibrent.Api.Common;

public enum EventState
{
    Active,
    Finished,
    Cancelled,
}

internal static class EventStateResolver
{
    public static EventState Resolve(EventStatus status, DateTimeOffset startsAt, DateTimeOffset now) => status switch
    {
        EventStatus.Cancelled => EventState.Cancelled,
        _ when startsAt <= now => EventState.Finished,
        _ => EventState.Active,
    };
}
