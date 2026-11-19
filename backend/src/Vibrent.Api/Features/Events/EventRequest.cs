namespace Vibrent.Api.Features.Events;

public sealed record EventRequest(
    Guid CategoryId,
    string Title,
    string Description,
    DateTimeOffset StartsAt,
    string Address,
    double Latitude,
    double Longitude,
    int Capacity);
