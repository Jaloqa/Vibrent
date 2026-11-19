using Microsoft.EntityFrameworkCore;
using Vibrent.Api.Common;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Events;

internal static class EventQueries
{
    public static Task<EventResponse?> FindEventResponseAsync(
        this AppDbContext dbContext,
        Guid eventId,
        DateTimeOffset now,
        CancellationToken cancellationToken) =>
        (from @event in dbContext.Events.AsNoTracking()
         join organizer in dbContext.Users on @event.OrganizerId equals organizer.Id
         join category in dbContext.Categories on @event.CategoryId equals category.Id
         where @event.Id == eventId
         select new EventResponse(
             @event.Id,
             @event.OrganizerId,
             organizer.DisplayName,
             @event.CategoryId,
             category.Name,
             @event.Title,
             @event.Description,
             @event.StartsAt,
             @event.Address,
             @event.Latitude,
             @event.Longitude,
             @event.Capacity,
             @event.AcceptedCount,
             @event.Capacity - @event.AcceptedCount,
             @event.ImageUrl,
             EventStateResolver.Resolve(@event.Status, @event.StartsAt, now),
             @event.CreatedAt))
        .SingleOrDefaultAsync(cancellationToken);
}
