using Vibrent.Domain.Common;

namespace Vibrent.Domain.Events;

public static class EventErrors
{
    public static readonly Error NoFreeSeats =
        Error.Conflict("Event.NoFreeSeats", "The event has no free seats left.");

    public static readonly Error Cancelled =
        Error.Conflict("Event.Cancelled", "The event is cancelled.");

    public static readonly Error Finished =
        Error.Conflict("Event.Finished", "The event has already taken place.");

    public static readonly Error CapacityBelowAccepted =
        Error.Conflict("Event.CapacityBelowAccepted", "Capacity cannot be lower than the number of accepted participants.");

    public static readonly Error OwnEvent =
        Error.Forbidden("Event.OwnEvent", "Organizers cannot apply to their own event.");
}
