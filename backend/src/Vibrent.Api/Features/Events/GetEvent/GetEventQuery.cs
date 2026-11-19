using MediatR;
using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Events.GetEvent;

public sealed record GetEventQuery(Guid EventId) : IRequest<Result<EventResponse>>;
