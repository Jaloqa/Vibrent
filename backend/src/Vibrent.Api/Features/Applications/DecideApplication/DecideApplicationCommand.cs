using MediatR;
using Vibrent.Domain.Applications;
using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Applications.DecideApplication;

public sealed record DecideApplicationCommand(Guid ApplicationId, Guid OrganizerId, ApplicationStatus Status)
    : IRequest<Result<ApplicationDecisionResponse>>;
