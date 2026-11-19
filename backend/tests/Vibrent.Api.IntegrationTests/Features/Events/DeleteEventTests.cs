using System.Net;
using Shouldly;

namespace Vibrent.Api.IntegrationTests.Features.Events;

[Collection(ApiFixtureDefinition.Name)]
public sealed class DeleteEventTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_DeleteEvent_When_EventHasNoApplications()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());
        var created = await client.CreateEventAsync();

        using var response = await client.DeleteAsync($"/events/{created.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        using var details = await client.GetAsync($"/events/{created.Id}");
        details.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_EventHasApplications()
    {
        using var organizer = factory.CreateClient();
        organizer.Authorize(await organizer.RegisterAndGetTokenAsync());
        var created = await organizer.CreateEventAsync();
        using var participant = factory.CreateClient();
        participant.Authorize(await participant.RegisterAndGetTokenAsync());
        await factory.SeedApplicationAsync(created.Id, await participant.GetMyIdAsync());

        using var response = await organizer.DeleteAsync($"/events/{created.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.HasApplications");
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_UserIsNotOrganizer()
    {
        using var organizer = factory.CreateClient();
        organizer.Authorize(await organizer.RegisterAndGetTokenAsync());
        var created = await organizer.CreateEventAsync();
        using var stranger = factory.CreateClient();
        stranger.Authorize(await stranger.RegisterAndGetTokenAsync());

        using var response = await stranger.DeleteAsync($"/events/{created.Id}");

        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.NotOrganizer");
    }
}
