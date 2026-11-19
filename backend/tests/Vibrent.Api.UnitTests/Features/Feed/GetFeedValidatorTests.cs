using Shouldly;
using Vibrent.Api.Features.Feed.GetFeed;

namespace Vibrent.Api.UnitTests.Features.Feed;

public sealed class GetFeedValidatorTests
{
    private readonly GetFeedValidator _validator = new();

    [Fact]
    public void Should_Pass_When_NoFiltersAreGiven()
    {
        _validator.Validate(Query()).IsValid.ShouldBeTrue();
    }

    [Fact]
    public void Should_Pass_When_FullLocationIsGiven()
    {
        _validator.Validate(Query() with { Latitude = 50.67, Longitude = 17.92, RadiusKm = 10 }).IsValid.ShouldBeTrue();
    }

    [Fact]
    public void Should_Fail_When_RadiusIsMissing()
    {
        var result = _validator.Validate(Query() with { Latitude = 50.67, Longitude = 17.92 });

        result.Errors.ShouldContain(error => error.PropertyName == "Location");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(200.1)]
    public void Should_Fail_When_RadiusIsOutOfRange(double radiusKm)
    {
        var result = _validator.Validate(Query() with { Latitude = 50.67, Longitude = 17.92, RadiusKm = radiusKm });

        result.Errors.ShouldContain(error => error.PropertyName == nameof(GetFeedQuery.RadiusKm));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(51)]
    public void Should_Fail_When_LimitIsOutOfRange(int limit)
    {
        var result = _validator.Validate(Query() with { Limit = limit });

        result.Errors.ShouldContain(error => error.PropertyName == nameof(GetFeedQuery.Limit));
    }

    private static GetFeedQuery Query() => new(
        Guid.CreateVersion7(),
        Latitude: null,
        Longitude: null,
        RadiusKm: null,
        CategoryId: null,
        Cursor: null,
        GetFeedQuery.DefaultLimit);
}
