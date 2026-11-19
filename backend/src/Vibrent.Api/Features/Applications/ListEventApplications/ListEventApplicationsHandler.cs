using MediatR;
using Microsoft.EntityFrameworkCore;
using Vibrent.Api.Common.Pagination;
using Vibrent.Domain.Common;
using Vibrent.Domain.Events;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Applications.ListEventApplications;

internal sealed class ListEventApplicationsHandler(AppDbContext dbContext)
    : IRequestHandler<ListEventApplicationsQuery, Result<PagedResponse<EventApplicationResponse>>>
{
    public async Task<Result<PagedResponse<EventApplicationResponse>>> Handle(
        ListEventApplicationsQuery query,
        CancellationToken cancellationToken)
    {
        var organizerId = await dbContext.Events
            .Where(@event => @event.Id == query.EventId)
            .Select(@event => (Guid?)@event.OrganizerId)
            .SingleOrDefaultAsync(cancellationToken);
        if (organizerId is null)
        {
            return EventErrors.NotFound;
        }

        if (organizerId != query.OrganizerId)
        {
            return EventErrors.NotOrganizer;
        }

        var applications = dbContext.Applications
            .AsNoTracking()
            .Where(application => application.EventId == query.EventId);
        if (query.Status is { } status)
        {
            applications = applications.Where(application => application.Status == status);
        }

        return await (from application in applications
                      join applicant in dbContext.Users on application.UserId equals applicant.Id
                      orderby application.CreatedAt, application.Id
                      select new EventApplicationResponse(
                          application.Id,
                          application.Status,
                          application.CreatedAt,
                          application.DecidedAt,
                          new ApplicantResponse(
                              applicant.Id,
                              applicant.DisplayName,
                              applicant.Bio,
                              applicant.AvatarUrl,
                              applicant.City)))
            .ToPagedResponseAsync(query, cancellationToken);
    }
}
