using MediatR;
using Microsoft.EntityFrameworkCore;
using Vibrent.Domain.Common;
using Vibrent.Domain.Events;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Events.DeleteEvent;

internal sealed class DeleteEventHandler(AppDbContext dbContext) : IRequestHandler<DeleteEventCommand, Result>
{
    public async Task<Result> Handle(DeleteEventCommand command, CancellationToken cancellationToken)
    {
        var @event = await dbContext.Events.SingleOrDefaultAsync(candidate => candidate.Id == command.EventId, cancellationToken);
        if (@event is null)
        {
            return EventErrors.NotFound;
        }

        if (@event.OrganizerId != command.OrganizerId)
        {
            return EventErrors.NotOrganizer;
        }

        if (await dbContext.Applications.AnyAsync(application => application.EventId == @event.Id, cancellationToken))
        {
            return EventErrors.HasApplications;
        }

        dbContext.Events.Remove(@event);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
