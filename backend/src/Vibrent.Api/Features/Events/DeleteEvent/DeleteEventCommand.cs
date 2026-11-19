using MediatR;
using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Events.DeleteEvent;

public sealed record DeleteEventCommand(Guid EventId, Guid OrganizerId) : IRequest<Result>;
