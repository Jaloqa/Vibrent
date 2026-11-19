using MediatR;
using Microsoft.EntityFrameworkCore;
using Vibrent.Api.Common;
using Vibrent.Api.Common.Pagination;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Applications.ListMyApplications;

internal sealed class ListMyApplicationsHandler(AppDbContext dbContext, TimeProvider timeProvider)
    : IRequestHandler<ListMyApplicationsQuery, PagedResponse<MyApplicationResponse>>
{
    public Task<PagedResponse<MyApplicationResponse>> Handle(ListMyApplicationsQuery query, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var applications = dbContext.Applications
            .AsNoTracking()
            .Where(application => application.UserId == query.UserId);
        if (query.Status is { } status)
        {
            applications = applications.Where(application => application.Status == status);
        }

        return (from application in applications
                join @event in dbContext.Events on application.EventId equals @event.Id
                orderby application.CreatedAt descending, application.Id descending
                select new MyApplicationResponse(
                    application.Id,
                    application.Status,
                    application.CreatedAt,
                    application.DecidedAt,
                    @event.Id,
                    @event.Title,
                    @event.StartsAt,
                    @event.Address,
                    EventStateResolver.Resolve(@event.Status, @event.StartsAt, now)))
            .ToPagedResponseAsync(query, cancellationToken);
    }
}
