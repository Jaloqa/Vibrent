using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Events.ListMyEvents;

public sealed record MyEventResponse(
    Guid Id,
    string Title,
    string CategoryName,
    DateTimeOffset StartsAt,
    string Address,
    int Capacity,
    int AcceptedCount,
    int FreeSeats,
    int PendingApplications,
    EventState Status);
