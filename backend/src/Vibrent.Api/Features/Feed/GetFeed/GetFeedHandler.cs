using MediatR;
using Microsoft.EntityFrameworkCore;
using Vibrent.Domain.Events;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Feed.GetFeed;

internal sealed class GetFeedHandler(AppDbContext dbContext, TimeProvider timeProvider)
    : IRequestHandler<GetFeedQuery, FeedPageResponse>
{
    private const double EarthRadiusKm = 6371;

    private const double KmPerDegreeOfLatitude = 111.2;

    private const double Radians = Math.PI / 180;

    public async Task<FeedPageResponse> Handle(GetFeedQuery query, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var userId = query.UserId;
        var hasLocation = query.Latitude is not null;
        var latitude = query.Latitude ?? 0;
        var longitude = query.Longitude ?? 0;

        var candidates =
            from @event in dbContext.Events.AsNoTracking()
            join organizer in dbContext.Users on @event.OrganizerId equals organizer.Id
            join category in dbContext.Categories on @event.CategoryId equals category.Id
            where @event.Status == EventStatus.Active
                && @event.StartsAt > now
                && @event.OrganizerId != userId
                && @event.AcceptedCount < @event.Capacity
                && !dbContext.Swipes.Any(swipe => swipe.EventId == @event.Id && swipe.UserId == userId)
            select new
            {
                Event = @event,
                OrganizerName = organizer.DisplayName,
                CategoryName = category.Name,
                DistanceKm = 2 * EarthRadiusKm * Math.Asin(Math.Min(1.0, Math.Sqrt(
                    Math.Pow(Math.Sin((@event.Latitude - latitude) * Radians / 2), 2)
                    + (Math.Cos(latitude * Radians) * Math.Cos(@event.Latitude * Radians)
                        * Math.Pow(Math.Sin((@event.Longitude - longitude) * Radians / 2), 2))))),
            };

        if (query.CategoryId is { } categoryId)
        {
            candidates = candidates.Where(candidate => candidate.Event.CategoryId == categoryId);
        }

        if (hasLocation)
        {
            var radiusKm = query.RadiusKm!.Value;
            var latitudeDelta = radiusKm / KmPerDegreeOfLatitude;
            candidates = candidates.Where(candidate =>
                candidate.Event.Latitude >= latitude - latitudeDelta
                && candidate.Event.Latitude <= latitude + latitudeDelta
                && candidate.DistanceKm <= radiusKm);
        }

        if (query.Cursor is not null && FeedCursor.TryDecode(query.Cursor, out var cursor))
        {
            candidates = candidates.Where(candidate =>
                candidate.Event.StartsAt > cursor.StartsAt
                || (candidate.Event.StartsAt == cursor.StartsAt && candidate.Event.Id.CompareTo(cursor.Id) > 0));
        }

        var cards = await candidates
            .OrderBy(candidate => candidate.Event.StartsAt)
            .ThenBy(candidate => candidate.Event.Id)
            .Take(query.Limit + 1)
            .Select(candidate => new FeedCardResponse(
                candidate.Event.Id,
                candidate.Event.Title,
                candidate.Event.Description,
                candidate.CategoryName,
                candidate.OrganizerName,
                candidate.Event.StartsAt,
                candidate.Event.Address,
                candidate.Event.Latitude,
                candidate.Event.Longitude,
                candidate.Event.Capacity,
                candidate.Event.Capacity - candidate.Event.AcceptedCount,
                candidate.Event.ImageUrl,
                hasLocation ? Math.Round(candidate.DistanceKm, 1) : null))
            .ToListAsync(cancellationToken);

        if (cards.Count <= query.Limit)
        {
            return new FeedPageResponse(cards, NextCursor: null);
        }

        cards.RemoveAt(cards.Count - 1);
        var last = cards[^1];

        return new FeedPageResponse(cards, new FeedCursor(last.StartsAt, last.Id).Encode());
    }
}
