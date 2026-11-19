using MediatR;
using Microsoft.EntityFrameworkCore;
using Vibrent.Domain.Applications;
using Vibrent.Domain.Common;
using Vibrent.Domain.Events;
using Vibrent.Domain.Swipes;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Swipes.SwipeEvent;

internal sealed class SwipeEventHandler(AppDbContext dbContext, TimeProvider timeProvider)
    : IRequestHandler<SwipeEventCommand, Result<SwipeResponse>>
{
    public async Task<Result<SwipeResponse>> Handle(SwipeEventCommand command, CancellationToken cancellationToken)
    {
        var @event = await dbContext.Events.SingleOrDefaultAsync(candidate => candidate.Id == command.EventId, cancellationToken);
        if (@event is null)
        {
            return EventErrors.NotFound;
        }

        var alreadySwiped = await dbContext.Swipes.AnyAsync(
            swipe => swipe.UserId == command.UserId && swipe.EventId == command.EventId,
            cancellationToken);
        if (alreadySwiped)
        {
            return SwipeErrors.AlreadySwiped;
        }

        var now = timeProvider.GetUtcNow();
        var swipe = @event.RecordSwipe(command.UserId, command.Decision, now);
        if (swipe.IsFailure)
        {
            return swipe.Error!;
        }

        dbContext.Swipes.Add(swipe.Value);

        EventApplication? application = null;
        if (command.Decision == SwipeDecision.Like)
        {
            application = EventApplication.FromLike(swipe.Value, now);
            dbContext.Applications.Add(application);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return new SwipeResponse(@event.Id, command.Decision, application?.Id);
    }
}
