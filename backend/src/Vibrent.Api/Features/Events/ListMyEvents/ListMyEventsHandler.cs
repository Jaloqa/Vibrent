using MediatR;
using Microsoft.EntityFrameworkCore;
using Vibrent.Api.Common;
using Vibrent.Api.Common.Pagination;
using Vibrent.Domain.Applications;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Events.ListMyEvents;

internal sealed class ListMyEventsHandler(AppDbContext dbContext, TimeProvider timeProvider)
    : IRequestHandler<ListMyEventsQuery, PagedResponse<MyEventResponse>>
{
    public Task<PagedResponse<MyEventResponse>> Handle(ListMyEventsQuery query, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();

        return (from @event in dbContext.Events.AsNoTracking()
                join category in dbContext.Categories on @event.CategoryId equals category.Id
                where @event.OrganizerId == query.OrganizerId
                orderby @event.StartsAt descending, @event.Id descending
                select new MyEventResponse(
                    @event.Id,
                    @event.Title,
                    category.Name,
                    @event.StartsAt,
                    @event.Address,
                    @event.Capacity,
                    @event.AcceptedCount,
                    @event.Capacity - @event.AcceptedCount,
                    dbContext.Applications.Count(application =>
                        application.EventId == @event.Id && application.Status == ApplicationStatus.Pending),
                    EventStateResolver.Resolve(@event.Status, @event.StartsAt, now)))
            .ToPagedResponseAsync(query, cancellationToken);
    }
}
