using Shouldly;
using Vibrent.Api.Features.Auth.ChangePassword;

namespace Vibrent.Api.UnitTests.Features.Auth;

public sealed class ChangePasswordValidatorTests
{
    private readonly ChangePasswordValidator _validator = new();

    [Fact]
    public void Should_Pass_When_NewPasswordIsValidAndDifferent()
    {
        var result = _validator.Validate(new ChangePasswordCommand(Guid.CreateVersion7(), "Old-secret1", "N3w-secret-pass"));

        result.IsValid.ShouldBeTrue();
    }

    [Fact]
    public void Should_Fail_When_NewPasswordEqualsCurrent()
    {
        var result = _validator.Validate(new ChangePasswordCommand(Guid.CreateVersion7(), "Same-secret1", "Same-secret1"));

        result.Errors.ShouldContain(error => error.PropertyName == nameof(ChangePasswordCommand.NewPassword));
    }

    [Fact]
    public void Should_Fail_When_NewPasswordIsTooShort()
    {
        var result = _validator.Validate(new ChangePasswordCommand(Guid.CreateVersion7(), "Old-secret1", "short"));

        result.Errors.ShouldContain(error => error.PropertyName == nameof(ChangePasswordCommand.NewPassword));
    }
}
