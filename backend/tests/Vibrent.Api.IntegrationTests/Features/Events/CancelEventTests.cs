using System.Net;
using Shouldly;
using Vibrent.Api.Common;
using Vibrent.Api.Features.Events;

namespace Vibrent.Api.IntegrationTests.Features.Events;

[Collection(ApiFixtureDefinition.Name)]
public sealed class CancelEventTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_MarkEventCancelled_When_OrganizerCancels()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());
        var created = await client.CreateEventAsync();

        using var response = await client.PostAsync($"/events/{created.Id}/cancel", content: null);

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        using var details = await client.GetAsync($"/events/{created.Id}");
        (await details.ReadAsAsync<EventResponse>()).Status.ShouldBe(EventState.Cancelled);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_EventIsAlreadyCancelled()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());
        var created = await client.CreateEventAsync();
        (await client.PostAsync($"/events/{created.Id}/cancel", content: null)).EnsureSuccessStatusCode();

        using var response = await client.PostAsync($"/events/{created.Id}/cancel", content: null);

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.Cancelled");
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_UserIsNotOrganizer()
    {
        using var organizer = factory.CreateClient();
        organizer.Authorize(await organizer.RegisterAndGetTokenAsync());
        var created = await organizer.CreateEventAsync();
        using var stranger = factory.CreateClient();
        stranger.Authorize(await stranger.RegisterAndGetTokenAsync());

        using var response = await stranger.PostAsync($"/events/{created.Id}/cancel", content: null);

        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.NotOrganizer");
    }
}
