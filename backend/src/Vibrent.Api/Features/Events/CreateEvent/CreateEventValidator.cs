using FluentValidation;

namespace Vibrent.Api.Features.Events.CreateEvent;

internal sealed class CreateEventValidator : AbstractValidator<CreateEventCommand>
{
    public CreateEventValidator(TimeProvider timeProvider)
    {
        RuleFor(command => command.CategoryId).NotEmpty();
        RuleFor(command => command.Title).NotEmpty().MaximumLength(100);
        RuleFor(command => command.Description).NotEmpty().MaximumLength(2000);
        RuleFor(command => command.StartsAt)
            .Must(startsAt => startsAt > timeProvider.GetUtcNow())
            .WithMessage("The event must start in the future.");
        RuleFor(command => command.Address).NotEmpty().MaximumLength(200);
        RuleFor(command => command.Latitude).InclusiveBetween(-90, 90);
        RuleFor(command => command.Longitude).InclusiveBetween(-180, 180);
        RuleFor(command => command.Capacity).InclusiveBetween(1, 1000);
    }
}
