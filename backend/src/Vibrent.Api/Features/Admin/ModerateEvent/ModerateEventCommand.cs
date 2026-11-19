using MediatR;
using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Admin.ModerateEvent;

public sealed record ModerateEventCommand(Guid EventId) : IRequest<Result>;
