namespace Vibrent.Api.Features.Feed.GetFeed;

public sealed record FeedCardResponse(
    Guid Id,
    string Title,
    string Description,
    string CategoryName,
    string OrganizerName,
    DateTimeOffset StartsAt,
    string Address,
    double Latitude,
    double Longitude,
    int Capacity,
    int FreeSeats,
    string? ImageUrl,
    double? DistanceKm);

public sealed record FeedPageResponse(IReadOnlyList<FeedCardResponse> Items, string? NextCursor);
