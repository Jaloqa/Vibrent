using Shouldly;
using Vibrent.Api.Features.Auth.Register;

namespace Vibrent.Api.UnitTests.Features.Auth;

public sealed class RegisterValidatorTests
{
    private readonly RegisterValidator _validator = new();

    [Fact]
    public void Should_Pass_When_DataIsValid()
    {
        var result = _validator.Validate(new RegisterCommand("ola@example.com", "Sup3r-secret", "Ola"));

        result.IsValid.ShouldBeTrue();
    }

    [Theory]
    [InlineData("", "Sup3r-secret", "Ola", nameof(RegisterCommand.Email))]
    [InlineData("not-an-email", "Sup3r-secret", "Ola", nameof(RegisterCommand.Email))]
    [InlineData("ola@example.com", "short", "Ola", nameof(RegisterCommand.Password))]
    [InlineData("ola@example.com", "Sup3r-secret", "", nameof(RegisterCommand.DisplayName))]
    public void Should_Fail_When_FieldIsInvalid(string email, string password, string displayName, string invalidField)
    {
        var result = _validator.Validate(new RegisterCommand(email, password, displayName));

        result.Errors.ShouldContain(error => error.PropertyName == invalidField);
    }

    [Fact]
    public void Should_Fail_When_DisplayNameIsTooLong()
    {
        var result = _validator.Validate(new RegisterCommand("ola@example.com", "Sup3r-secret", new string('a', 51)));

        result.Errors.ShouldContain(error => error.PropertyName == nameof(RegisterCommand.DisplayName));
    }
}
