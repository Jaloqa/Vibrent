using MediatR;
using Vibrent.Domain.Common;
using Vibrent.Domain.Swipes;

namespace Vibrent.Api.Features.Swipes.SwipeEvent;

public sealed record SwipeEventCommand(Guid EventId, Guid UserId, SwipeDecision Decision) : IRequest<Result<SwipeResponse>>;
