using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Vibrent.Api.Features.Swipes.SwipeEvent;
using Vibrent.Api.IntegrationTests.Features.Events;
using Vibrent.Domain.Applications;
using Vibrent.Domain.Swipes;
using static Vibrent.Api.IntegrationTests.Features.Events.EventsTestData;

namespace Vibrent.Api.IntegrationTests.Features.Swipes;

[Collection(ApiFixtureDefinition.Name)]
public sealed class SwipeEventTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_CreatePendingApplication_When_UserLikesEvent()
    {
        var eventId = await CreateEventAsync();
        using var participant = await SignedInClientAsync();

        using var response = await participant.PostAsJsonAsync($"/events/{eventId}/swipe", new { decision = "Like" });

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var swipe = await response.ReadAsAsync<SwipeResponse>();
        swipe.Decision.ShouldBe(SwipeDecision.Like);
        var applicationId = swipe.ApplicationId.ShouldNotBeNull();
        await using var dbContext = factory.CreateDbContext();
        var application = await dbContext.Applications.SingleAsync(candidate => candidate.Id == applicationId);
        application.Status.ShouldBe(ApplicationStatus.Pending);
        application.UserId.ShouldBe(await participant.GetMyIdAsync());
    }

    [Fact]
    public async Task Should_NotCreateApplication_When_UserDislikesEvent()
    {
        var eventId = await CreateEventAsync();
        using var participant = await SignedInClientAsync();

        using var response = await participant.PostAsJsonAsync($"/events/{eventId}/swipe", new { decision = "Dislike" });

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        (await response.ReadAsAsync<SwipeResponse>()).ApplicationId.ShouldBeNull();
        await using var dbContext = factory.CreateDbContext();
        (await dbContext.Applications.AnyAsync(application => application.EventId == eventId)).ShouldBeFalse();
    }

    [Fact]
    public async Task Should_ReturnAlreadySwiped_When_UserSwipesSameEventTwice()
    {
        var eventId = await CreateEventAsync();
        using var participant = await SignedInClientAsync();
        (await participant.PostAsJsonAsync($"/events/{eventId}/swipe", new { decision = "Dislike" })).EnsureSuccessStatusCode();

        using var response = await participant.PostAsJsonAsync($"/events/{eventId}/swipe", new { decision = "Like" });

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        (await response.ReadProblemCodeAsync()).ShouldBe("Swipe.AlreadySwiped");
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_OrganizerLikesOwnEvent()
    {
        using var organizer = await SignedInClientAsync();
        var created = await organizer.CreateEventAsync();

        using var response = await organizer.PostAsJsonAsync($"/events/{created.Id}/swipe", new { decision = "Like" });

        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.OwnEvent");
    }

    [Fact]
    public async Task Should_ReturnConflict_When_EventHasNoFreeSeats()
    {
        var eventId = await CreateEventAsync(capacity: 1);
        using var accepted = await SignedInClientAsync();
        await factory.SeedApplicationAsync(eventId, await accepted.GetMyIdAsync(), accept: true);
        using var participant = await SignedInClientAsync();

        using var response = await participant.PostAsJsonAsync($"/events/{eventId}/swipe", new { decision = "Like" });

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.NoFreeSeats");
    }

    [Fact]
    public async Task Should_ReturnConflict_When_EventIsCancelled()
    {
        using var organizer = await SignedInClientAsync();
        var created = await organizer.CreateEventAsync();
        (await organizer.PostAsync($"/events/{created.Id}/cancel", content: null)).EnsureSuccessStatusCode();
        using var participant = await SignedInClientAsync();

        using var response = await participant.PostAsJsonAsync($"/events/{created.Id}/swipe", new { decision = "Like" });

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.Cancelled");
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_EventDoesNotExist()
    {
        using var participant = await SignedInClientAsync();

        using var response = await participant.PostAsJsonAsync($"/events/{Guid.CreateVersion7()}/swipe", new { decision = "Like" });

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.NotFound");
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_DecisionIsUnknown()
    {
        var eventId = await CreateEventAsync();
        using var participant = await SignedInClientAsync();

        using var response = await participant.PostAsJsonAsync($"/events/{eventId}/swipe", new { decision = "SuperLike" });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    private async Task<Guid> CreateEventAsync(int capacity = 10)
    {
        using var organizer = await SignedInClientAsync();
        return (await organizer.CreateEventAsync(ValidRequest(capacity: capacity))).Id;
    }

    private async Task<HttpClient> SignedInClientAsync()
    {
        var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());
        return client;
    }
}
