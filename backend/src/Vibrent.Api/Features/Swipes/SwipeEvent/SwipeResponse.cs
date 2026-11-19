using Vibrent.Domain.Swipes;

namespace Vibrent.Api.Features.Swipes.SwipeEvent;

public sealed record SwipeResponse(Guid EventId, SwipeDecision Decision, Guid? ApplicationId);
