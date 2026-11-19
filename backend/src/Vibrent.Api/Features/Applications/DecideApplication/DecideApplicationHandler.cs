using MediatR;
using Microsoft.EntityFrameworkCore;
using Vibrent.Domain.Applications;
using Vibrent.Domain.Common;
using Vibrent.Domain.Events;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Applications.DecideApplication;

internal sealed class DecideApplicationHandler(AppDbContext dbContext, TimeProvider timeProvider)
    : IRequestHandler<DecideApplicationCommand, Result<ApplicationDecisionResponse>>
{
    public async Task<Result<ApplicationDecisionResponse>> Handle(DecideApplicationCommand command, CancellationToken cancellationToken)
    {
        var application = await dbContext.Applications
            .SingleOrDefaultAsync(candidate => candidate.Id == command.ApplicationId, cancellationToken);
        if (application is null)
        {
            return ApplicationErrors.NotFound;
        }

        var @event = await dbContext.Events.SingleAsync(candidate => candidate.Id == application.EventId, cancellationToken);
        if (@event.OrganizerId != command.OrganizerId)
        {
            return EventErrors.NotOrganizer;
        }

        var now = timeProvider.GetUtcNow();
        var decision = command.Status == ApplicationStatus.Accepted
            ? application.Accept(@event, now)
            : application.Reject(now);
        if (decision.IsFailure)
        {
            return decision.Error!;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return new ApplicationDecisionResponse(application.Id, application.Status, now, @event.FreeSeats);
    }
}
