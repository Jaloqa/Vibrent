using FluentValidation;

namespace Vibrent.Api.Features.Swipes.SwipeEvent;

internal sealed class SwipeEventValidator : AbstractValidator<SwipeEventCommand>
{
    public SwipeEventValidator() => RuleFor(command => command.Decision).IsInEnum();
}
