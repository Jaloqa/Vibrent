using Shouldly;
using Vibrent.Api.Features.Events.CreateEvent;

namespace Vibrent.Api.UnitTests.Features.Events;

public sealed class CreateEventValidatorTests
{
    private static readonly DateTimeOffset Now = new(2026, 11, 19, 12, 0, 0, TimeSpan.Zero);

    private readonly CreateEventValidator _validator = new(new FixedTimeProvider(Now));

    [Fact]
    public void Should_Pass_When_CommandIsValid()
    {
        _validator.Validate(ValidCommand()).IsValid.ShouldBeTrue();
    }

    [Fact]
    public void Should_Fail_When_EventStartsNow()
    {
        var result = _validator.Validate(ValidCommand() with { StartsAt = Now });

        result.Errors.ShouldContain(error => error.PropertyName == nameof(CreateEventCommand.StartsAt));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1001)]
    public void Should_Fail_When_CapacityIsOutOfRange(int capacity)
    {
        var result = _validator.Validate(ValidCommand() with { Capacity = capacity });

        result.Errors.ShouldContain(error => error.PropertyName == nameof(CreateEventCommand.Capacity));
    }

    [Theory]
    [InlineData(-90.1, 0)]
    [InlineData(90.1, 0)]
    [InlineData(0, -180.1)]
    [InlineData(0, 180.1)]
    public void Should_Fail_When_CoordinatesAreOutOfRange(double latitude, double longitude)
    {
        var result = _validator.Validate(ValidCommand() with { Latitude = latitude, Longitude = longitude });

        result.IsValid.ShouldBeFalse();
    }

    [Fact]
    public void Should_Fail_When_TitleIsBlank()
    {
        var result = _validator.Validate(ValidCommand() with { Title = " " });

        result.Errors.ShouldContain(error => error.PropertyName == nameof(CreateEventCommand.Title));
    }

    private static CreateEventCommand ValidCommand() => new(
        Guid.CreateVersion7(),
        Guid.CreateVersion7(),
        "Board games night",
        "Bring your favourite game.",
        Now.AddDays(1),
        "Opole, Rynek 1",
        50.6683,
        17.9231,
        10);
}
