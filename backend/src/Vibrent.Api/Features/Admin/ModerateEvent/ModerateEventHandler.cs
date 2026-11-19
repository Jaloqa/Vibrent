using MediatR;
using Microsoft.EntityFrameworkCore;
using Vibrent.Domain.Common;
using Vibrent.Domain.Events;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Admin.ModerateEvent;

internal sealed class ModerateEventHandler(AppDbContext dbContext) : IRequestHandler<ModerateEventCommand, Result>
{
    public async Task<Result> Handle(ModerateEventCommand command, CancellationToken cancellationToken)
    {
        var @event = await dbContext.Events.SingleOrDefaultAsync(candidate => candidate.Id == command.EventId, cancellationToken);
        if (@event is null)
        {
            return EventErrors.NotFound;
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
