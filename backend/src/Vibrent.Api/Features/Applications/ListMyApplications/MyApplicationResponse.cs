using Vibrent.Api.Common;
using Vibrent.Domain.Applications;

namespace Vibrent.Api.Features.Applications.ListMyApplications;

public sealed record MyApplicationResponse(
    Guid Id,
    ApplicationStatus Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset? DecidedAt,
    Guid EventId,
    string EventTitle,
    DateTimeOffset EventStartsAt,
    string EventAddress,
    EventState EventStatus);
