using System.Net;
using Shouldly;
using Vibrent.Api.Common;
using Vibrent.Api.Features.Events;
using Vibrent.Api.IntegrationTests.Features.Applications;
using Vibrent.Api.IntegrationTests.Features.Events;

namespace Vibrent.Api.IntegrationTests.Features.Admin;

[Collection(ApiFixtureDefinition.Name)]
public sealed class ModerateEventTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_CancelEventOfAnotherUser_When_AdminModerates()
    {
        using var admin = await factory.SignedInAdminAsync();
        using var organizer = await factory.SignedInClientAsync();
        var created = await organizer.CreateEventAsync();

        using var response = await admin.PostAsync($"/admin/events/{created.Id}/cancel", content: null);

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        using var details = await organizer.GetAsync($"/events/{created.Id}");
        (await details.ReadAsAsync<EventResponse>()).Status.ShouldBe(EventState.Cancelled);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_EventDoesNotExist()
    {
        using var admin = await factory.SignedInAdminAsync();

        using var response = await admin.PostAsync($"/admin/events/{Guid.CreateVersion7()}/cancel", content: null);

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.NotFound");
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_CallerIsNotAdmin()
    {
        using var organizer = await factory.SignedInClientAsync();
        var created = await organizer.CreateEventAsync();
        using var stranger = await factory.SignedInClientAsync();

        using var response = await stranger.PostAsync($"/admin/events/{created.Id}/cancel", content: null);

        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
    }
}
