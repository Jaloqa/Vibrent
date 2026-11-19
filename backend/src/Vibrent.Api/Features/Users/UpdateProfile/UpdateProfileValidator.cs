using FluentValidation;

namespace Vibrent.Api.Features.Users.UpdateProfile;

internal sealed class UpdateProfileValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileValidator()
    {
        RuleFor(command => command.DisplayName).NotEmpty().MaximumLength(50);
        RuleFor(command => command.Bio).MaximumLength(500);
        RuleFor(command => command.City).MaximumLength(100);
    }
}
