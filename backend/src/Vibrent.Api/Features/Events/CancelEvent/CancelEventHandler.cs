using MediatR;
using Microsoft.EntityFrameworkCore;
using Vibrent.Domain.Common;
using Vibrent.Domain.Events;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Events.CancelEvent;

internal sealed class CancelEventHandler(AppDbContext dbContext) : IRequestHandler<CancelEventCommand, Result>
{
    public async Task<Result> Handle(CancelEventCommand command, CancellationToken cancellationToken)
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

        var result = @event.Cancel();
        if (result.IsFailure)
        {
            return result;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
