using MediatR;
using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Events.CancelEvent;

public sealed record CancelEventCommand(Guid EventId, Guid OrganizerId) : IRequest<Result>;
