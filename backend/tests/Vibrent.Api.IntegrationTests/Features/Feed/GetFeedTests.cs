using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using Shouldly;
using Vibrent.Api.Features.Events;
using Vibrent.Api.Features.Feed.GetFeed;
using Vibrent.Api.IntegrationTests.Features.Events;
using static Vibrent.Api.IntegrationTests.Features.Events.EventsTestData;

namespace Vibrent.Api.IntegrationTests.Features.Feed;

[Collection(ApiFixtureDefinition.Name)]
public sealed class GetFeedTests(ApiFactory factory)
{
    private readonly double _latitude = Random.Shared.Next(-60_000, 60_000) / 1000.0;

    private readonly double _longitude = Random.Shared.Next(-170_000, 170_000) / 1000.0;

    [Fact]
    public async Task Should_ReturnUpcomingEventsOrderedByStart_When_TheyAreNearby()
    {
        using var organizer = await SignedInClientAsync();
        var later = await organizer.CreateEventAsync(Nearby(startsInDays: 2));
        var sooner = await organizer.CreateEventAsync(Nearby(startsInDays: 1));
        using var participant = await SignedInClientAsync();

        var page = await participant.GetFeedAsync(FeedUrl());

        page.Items.Select(card => card.Id).ShouldBe([sooner.Id, later.Id]);
        page.Items[0].OrganizerName.ShouldBe("Test user");
        page.Items[0].DistanceKm.ShouldBe(0);
        page.NextCursor.ShouldBeNull();
    }

    [Fact]
    public async Task Should_SkipOwnEvents_When_OrganizerOpensFeed()
    {
        using var organizer = await SignedInClientAsync();
        await organizer.CreateEventAsync(Nearby());

        var page = await organizer.GetFeedAsync(FeedUrl());

        page.Items.ShouldBeEmpty();
    }

    [Fact]
    public async Task Should_SkipSwipedEvents_When_UserAlreadyDecided()
    {
        using var organizer = await SignedInClientAsync();
        var liked = await organizer.CreateEventAsync(Nearby(startsInDays: 1));
        var disliked = await organizer.CreateEventAsync(Nearby(startsInDays: 2));
        var remaining = await organizer.CreateEventAsync(Nearby(startsInDays: 3));
        using var participant = await SignedInClientAsync();
        (await participant.PostAsJsonAsync($"/events/{liked.Id}/swipe", new { decision = "Like" })).EnsureSuccessStatusCode();
        (await participant.PostAsJsonAsync($"/events/{disliked.Id}/swipe", new { decision = "Dislike" })).EnsureSuccessStatusCode();

        var page = await participant.GetFeedAsync(FeedUrl());

        page.Items.Select(card => card.Id).ShouldBe([remaining.Id]);
    }

    [Fact]
    public async Task Should_SkipFullAndCancelledEvents_When_TheyAreNearby()
    {
        using var organizer = await SignedInClientAsync();
        var full = await organizer.CreateEventAsync(Nearby(capacity: 1));
        using var accepted = await SignedInClientAsync();
        await factory.SeedApplicationAsync(full.Id, await accepted.GetMyIdAsync(), accept: true);
        var cancelled = await organizer.CreateEventAsync(Nearby());
        (await organizer.PostAsync($"/events/{cancelled.Id}/cancel", content: null)).EnsureSuccessStatusCode();
        using var participant = await SignedInClientAsync();

        var page = await participant.GetFeedAsync(FeedUrl());

        page.Items.ShouldBeEmpty();
    }

    [Fact]
    public async Task Should_SkipEvents_When_TheyAreOutsideRadius()
    {
        using var organizer = await SignedInClientAsync();
        var inside = await organizer.CreateEventAsync(Nearby() with { Latitude = _latitude + 0.05 });
        await organizer.CreateEventAsync(Nearby() with { Latitude = _latitude + 0.2 });
        using var participant = await SignedInClientAsync();

        var page = await participant.GetFeedAsync(FeedUrl(radiusKm: 10));

        var card = page.Items.ShouldHaveSingleItem();
        card.Id.ShouldBe(inside.Id);
        card.DistanceKm.ShouldNotBeNull().ShouldBe(5.6, tolerance: 0.1);
    }

    [Fact]
    public async Task Should_ReturnOnlySelectedCategory_When_CategoryIsGiven()
    {
        using var organizer = await SignedInClientAsync();
        var sport = await organizer.CreateEventAsync(Nearby() with { CategoryId = SportCategoryId });
        await organizer.CreateEventAsync(Nearby());
        using var participant = await SignedInClientAsync();

        var page = await participant.GetFeedAsync($"{FeedUrl()}&categoryId={SportCategoryId}");

        page.Items.Select(card => card.Id).ShouldBe([sport.Id]);
    }

    [Fact]
    public async Task Should_PageWithCursor_When_MoreEventsThanLimit()
    {
        using var organizer = await SignedInClientAsync();
        var created = new List<EventResponse>();
        for (var day = 1; day <= 3; day++)
        {
            created.Add(await organizer.CreateEventAsync(Nearby(startsInDays: day)));
        }

        using var participant = await SignedInClientAsync();

        var first = await participant.GetFeedAsync($"{FeedUrl()}&limit=2");
        var second = await participant.GetFeedAsync($"{FeedUrl()}&limit=2&cursor={first.NextCursor}");

        first.Items.Select(card => card.Id).ShouldBe([created[0].Id, created[1].Id]);
        first.NextCursor.ShouldNotBeNull();
        second.Items.Select(card => card.Id).ShouldBe([created[2].Id]);
        second.NextCursor.ShouldBeNull();
    }

    [Fact]
    public async Task Should_ReturnValidationProblem_When_LocationIsIncomplete()
    {
        using var participant = await SignedInClientAsync();

        using var response = await participant.GetAsync("/events/feed?lat=50.1");

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Should_ReturnValidationProblem_When_CursorIsInvalid()
    {
        using var participant = await SignedInClientAsync();

        using var response = await participant.GetAsync("/events/feed?cursor=not-a-cursor");

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    private async Task<HttpClient> SignedInClientAsync()
    {
        var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());
        return client;
    }

    private EventRequest Nearby(int startsInDays = 1, int capacity = 10) =>
        ValidRequest(capacity: capacity, startsAt: DateTimeOffset.UtcNow.AddDays(startsInDays)) with
        {
            Latitude = _latitude,
            Longitude = _longitude,
        };

    private string FeedUrl(double radiusKm = 1) => string.Create(
        CultureInfo.InvariantCulture,
        $"/events/feed?lat={_latitude}&lng={_longitude}&radiusKm={radiusKm}");
}
