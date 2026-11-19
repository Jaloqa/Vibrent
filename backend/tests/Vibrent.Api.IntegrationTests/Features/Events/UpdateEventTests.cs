using System.Net;
using System.Net.Http.Json;
using Shouldly;
using Vibrent.Api.Features.Events;
using static Vibrent.Api.IntegrationTests.Features.Events.EventsTestData;

namespace Vibrent.Api.IntegrationTests.Features.Events;

[Collection(ApiFixtureDefinition.Name)]
public sealed class UpdateEventTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_UpdateEvent_When_OrganizerSendsValidData()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());
        var created = await client.CreateEventAsync();

        using var response = await client.PutAsJsonAsync(
            $"/events/{created.Id}",
            ValidRequest(capacity: 3, categoryId: SportCategoryId, title: "Evening run"));

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var updated = await response.ReadAsAsync<EventResponse>();
        updated.Title.ShouldBe("Evening run");
        updated.CategoryName.ShouldBe("Sport");
        updated.Capacity.ShouldBe(3);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_UserIsNotOrganizer()
    {
        using var organizer = factory.CreateClient();
        organizer.Authorize(await organizer.RegisterAndGetTokenAsync());
        var created = await organizer.CreateEventAsync();
        using var stranger = factory.CreateClient();
        stranger.Authorize(await stranger.RegisterAndGetTokenAsync());

        using var response = await stranger.PutAsJsonAsync($"/events/{created.Id}", ValidRequest(title: "Hijacked"));

        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.NotOrganizer");
    }

    [Fact]
    public async Task Should_ReturnConflict_When_CapacityIsBelowAcceptedCount()
    {
        using var organizer = factory.CreateClient();
        organizer.Authorize(await organizer.RegisterAndGetTokenAsync());
        var created = await organizer.CreateEventAsync(ValidRequest(capacity: 2));
        using var participant = factory.CreateClient();
        participant.Authorize(await participant.RegisterAndGetTokenAsync());
        await factory.SeedApplicationAsync(created.Id, await participant.GetMyIdAsync(), accept: true);
        using var secondParticipant = factory.CreateClient();
        secondParticipant.Authorize(await secondParticipant.RegisterAndGetTokenAsync());
        await factory.SeedApplicationAsync(created.Id, await secondParticipant.GetMyIdAsync(), accept: true);

        using var response = await organizer.PutAsJsonAsync($"/events/{created.Id}", ValidRequest(capacity: 1));

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.CapacityBelowAccepted");
    }

    [Fact]
    public async Task Should_ReturnConflict_When_EventIsCancelled()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());
        var created = await client.CreateEventAsync();
        (await client.PostAsync($"/events/{created.Id}/cancel", content: null)).EnsureSuccessStatusCode();

        using var response = await client.PutAsJsonAsync($"/events/{created.Id}", ValidRequest());

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.Cancelled");
    }

    [Fact]
    public async Task Should_ReturnConflict_When_EventAlreadyStarted()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());
        var eventId = await factory.SeedStartedEventAsync(await client.GetMyIdAsync());

        using var response = await client.PutAsJsonAsync($"/events/{eventId}", ValidRequest());

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.Finished");
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_EventDoesNotExist()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());

        using var response = await client.PutAsJsonAsync($"/events/{Guid.CreateVersion7()}", ValidRequest());

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.NotFound");
    }
}
