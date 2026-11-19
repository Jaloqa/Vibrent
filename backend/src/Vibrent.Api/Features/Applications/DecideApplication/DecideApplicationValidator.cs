using FluentValidation;
using Vibrent.Domain.Applications;

namespace Vibrent.Api.Features.Applications.DecideApplication;

internal sealed class DecideApplicationValidator : AbstractValidator<DecideApplicationCommand>
{
    public DecideApplicationValidator() => RuleFor(command => command.Status)
        .Must(status => status is ApplicationStatus.Accepted or ApplicationStatus.Rejected)
        .WithMessage("The decision must be Accepted or Rejected.");
}
