using MediatR;
using Microsoft.EntityFrameworkCore;
using Vibrent.Domain.Categories;
using Vibrent.Domain.Common;
using Vibrent.Domain.Events;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Events.CreateEvent;

internal sealed class CreateEventHandler(AppDbContext dbContext, TimeProvider timeProvider)
    : IRequestHandler<CreateEventCommand, Result<EventResponse>>
{
    public async Task<Result<EventResponse>> Handle(CreateEventCommand command, CancellationToken cancellationToken)
    {
        if (!await dbContext.Categories.AnyAsync(category => category.Id == command.CategoryId, cancellationToken))
        {
            return CategoryErrors.NotFound;
        }

        var now = timeProvider.GetUtcNow();
        var @event = Event.Create(
            command.OrganizerId,
            command.CategoryId,
            command.Title.Trim(),
            command.Description.Trim(),
            command.StartsAt,
            command.Address.Trim(),
            command.Latitude,
            command.Longitude,
            command.Capacity,
            imageUrl: null,
            now);

        dbContext.Events.Add(@event);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = await dbContext.FindEventResponseAsync(@event.Id, now, cancellationToken);

        return response!;
    }
}
