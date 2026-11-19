using MediatR;
using Microsoft.EntityFrameworkCore;
using Vibrent.Domain.Categories;
using Vibrent.Domain.Common;
using Vibrent.Domain.Events;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Events.UpdateEvent;

internal sealed class UpdateEventHandler(AppDbContext dbContext, TimeProvider timeProvider)
    : IRequestHandler<UpdateEventCommand, Result<EventResponse>>
{
    public async Task<Result<EventResponse>> Handle(UpdateEventCommand command, CancellationToken cancellationToken)
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

        if (!await dbContext.Categories.AnyAsync(category => category.Id == command.CategoryId, cancellationToken))
        {
            return CategoryErrors.NotFound;
        }

        var now = timeProvider.GetUtcNow();
        var update = @event.UpdateDetails(
            command.CategoryId,
            command.Title.Trim(),
            command.Description.Trim(),
            command.StartsAt,
            command.Address.Trim(),
            command.Latitude,
            command.Longitude,
            @event.ImageUrl,
            now);
        if (update.IsFailure)
        {
            return update.Error!;
        }

        var capacityChange = @event.ChangeCapacity(command.Capacity);
        if (capacityChange.IsFailure)
        {
            return capacityChange.Error!;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var response = await dbContext.FindEventResponseAsync(@event.Id, now, cancellationToken);

        return response!;
    }
}
