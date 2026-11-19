using MediatR;

namespace Vibrent.Api.Features.Feed.GetFeed;

public sealed record GetFeedQuery(
    Guid UserId,
    double? Latitude,
    double? Longitude,
    double? RadiusKm,
    Guid? CategoryId,
    string? Cursor,
    int Limit) : IRequest<FeedPageResponse>
{
    public const int DefaultLimit = 20;

    public const int MaxLimit = 50;

    public const double MaxRadiusKm = 200;
}
