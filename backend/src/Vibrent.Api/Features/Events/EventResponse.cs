using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Events;

public sealed record EventResponse(
    Guid Id,
    Guid OrganizerId,
    string OrganizerName,
    Guid CategoryId,
    string CategoryName,
    string Title,
    string Description,
    DateTimeOffset StartsAt,
    string Address,
    double Latitude,
    double Longitude,
    int Capacity,
    int AcceptedCount,
    int FreeSeats,
    string? ImageUrl,
    EventState Status,
    DateTimeOffset CreatedAt);
