using System.Net;
using Shouldly;
using Vibrent.Api.Common;
using Vibrent.Api.Features.Events;

namespace Vibrent.Api.IntegrationTests.Features.Events;

[Collection(ApiFixtureDefinition.Name)]
public sealed class GetEventTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_ReturnEventDetails_When_AnotherUserOpensIt()
    {
        using var organizer = factory.CreateClient();
        organizer.Authorize(await organizer.RegisterAndGetTokenAsync());
        var created = await organizer.CreateEventAsync();
        using var participant = factory.CreateClient();
        participant.Authorize(await participant.RegisterAndGetTokenAsync());

        using var response = await participant.GetAsync($"/events/{created.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var details = await response.ReadAsAsync<EventResponse>();
        details.ShouldBe(created);
        details.OrganizerName.ShouldBe("Test user");
    }

    [Fact]
    public async Task Should_ReturnFinishedStatus_When_EventAlreadyStarted()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());
        var eventId = await factory.SeedStartedEventAsync(await client.GetMyIdAsync());

        using var response = await client.GetAsync($"/events/{eventId}");

        (await response.ReadAsAsync<EventResponse>()).Status.ShouldBe(EventState.Finished);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_EventDoesNotExist()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());

        using var response = await client.GetAsync($"/events/{Guid.CreateVersion7()}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.NotFound");
    }
}
