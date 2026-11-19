using Vibrent.Domain.Applications;

namespace Vibrent.Api.Features.Applications.DecideApplication;

public sealed record ApplicationDecisionResponse(Guid Id, ApplicationStatus Status, DateTimeOffset DecidedAt, int EventFreeSeats);
