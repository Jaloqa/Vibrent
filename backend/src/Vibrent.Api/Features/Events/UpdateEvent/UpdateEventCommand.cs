using MediatR;
using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Events.UpdateEvent;

public sealed record UpdateEventCommand(
    Guid EventId,
    Guid OrganizerId,
    Guid CategoryId,
    string Title,
    string Description,
    DateTimeOffset StartsAt,
    string Address,
    double Latitude,
    double Longitude,
    int Capacity) : IRequest<Result<EventResponse>>;
