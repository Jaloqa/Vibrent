using MediatR;
using Vibrent.Domain.Common;
using Vibrent.Domain.Events;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Events.GetEvent;

internal sealed class GetEventHandler(AppDbContext dbContext, TimeProvider timeProvider)
    : IRequestHandler<GetEventQuery, Result<EventResponse>>
{
    public async Task<Result<EventResponse>> Handle(GetEventQuery query, CancellationToken cancellationToken)
    {
        var response = await dbContext.FindEventResponseAsync(query.EventId, timeProvider.GetUtcNow(), cancellationToken);

        return response is null ? EventErrors.NotFound : response;
    }
}
