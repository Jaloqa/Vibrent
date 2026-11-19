using Shouldly;
using Vibrent.Api.Features.Applications.DecideApplication;
using Vibrent.Domain.Applications;

namespace Vibrent.Api.UnitTests.Features.Applications;

public sealed class DecideApplicationValidatorTests
{
    private readonly DecideApplicationValidator _validator = new();

    [Theory]
    [InlineData(ApplicationStatus.Accepted)]
    [InlineData(ApplicationStatus.Rejected)]
    public void Should_Pass_When_DecisionIsAcceptOrReject(ApplicationStatus status)
    {
        _validator.Validate(new DecideApplicationCommand(Guid.CreateVersion7(), Guid.CreateVersion7(), status))
            .IsValid.ShouldBeTrue();
    }

    [Theory]
    [InlineData(ApplicationStatus.Pending)]
    [InlineData(ApplicationStatus.Withdrawn)]
    public void Should_Fail_When_DecisionIsNotAcceptOrReject(ApplicationStatus status)
    {
        _validator.Validate(new DecideApplicationCommand(Guid.CreateVersion7(), Guid.CreateVersion7(), status))
            .Errors.ShouldContain(error => error.PropertyName == nameof(DecideApplicationCommand.Status));
    }
}
