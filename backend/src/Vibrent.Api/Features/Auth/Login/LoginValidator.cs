using FluentValidation;

namespace Vibrent.Api.Features.Auth.Login;

internal sealed class LoginValidator : AbstractValidator<LoginCommand>
{
    public LoginValidator()
    {
        RuleFor(command => command.Email).NotEmpty();
        RuleFor(command => command.Password).NotEmpty();
    }
}
