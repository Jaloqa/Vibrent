using FluentValidation;

namespace Vibrent.Api.Features.Feed.GetFeed;

internal sealed class GetFeedValidator : AbstractValidator<GetFeedQuery>
{
    public GetFeedValidator()
    {
        RuleFor(query => query)
            .Must(query => (query.Latitude, query.Longitude, query.RadiusKm) is (null, null, null) or (not null, not null, not null))
            .WithName("Location")
            .WithMessage("Latitude, longitude and radius must be given together.");
        RuleFor(query => query.Latitude).InclusiveBetween(-90, 90);
        RuleFor(query => query.Longitude).InclusiveBetween(-180, 180);
        RuleFor(query => query.RadiusKm).GreaterThan(0).LessThanOrEqualTo(GetFeedQuery.MaxRadiusKm);
        RuleFor(query => query.Limit).InclusiveBetween(1, GetFeedQuery.MaxLimit);
        RuleFor(query => query.Cursor)
            .Must(cursor => cursor is null || FeedCursor.TryDecode(cursor, out _))
            .WithMessage("The cursor is invalid.");
    }
}
