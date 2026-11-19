using Vibrent.Domain.Applications;

namespace Vibrent.Api.Features.Applications.ListEventApplications;

public sealed record EventApplicationResponse(
    Guid Id,
    ApplicationStatus Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset? DecidedAt,
    ApplicantResponse Applicant);

public sealed record ApplicantResponse(Guid Id, string DisplayName, string? Bio, string? AvatarUrl, string? City);
