using FluentValidation;

namespace Vibrent.Api.Features.Auth.ChangePassword;

internal sealed class ChangePasswordValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordValidator()
    {
        RuleFor(command => command.CurrentPassword).NotEmpty();
        RuleFor(command => command.NewPassword)
            .NotEmpty()
            .MinimumLength(8)
            .MaximumLength(128)
            .NotEqual(command => command.CurrentPassword)
            .WithMessage("The new password must differ from the current one.");
    }
}
