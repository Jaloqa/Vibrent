using System.Net;
using System.Net.Http.Json;
using Shouldly;
using Vibrent.Api.Common.Pagination;
using Vibrent.Api.Features.Applications.ListEventApplications;
using Vibrent.Api.IntegrationTests.Features.Events;
using Vibrent.Domain.Applications;

namespace Vibrent.Api.IntegrationTests.Features.Applications;

[Collection(ApiFixtureDefinition.Name)]
public sealed class ListEventApplicationsTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_ReturnApplicationsWithApplicantProfiles_When_OrganizerAsks()
    {
        using var organizer = await factory.SignedInClientAsync();
        var created = await organizer.CreateEventAsync();
        using var participant = await factory.SignedInClientAsync();
        (await participant.PutAsJsonAsync("/users/me", new { displayName = "Ola", bio = "Chess fan", city = "Opole" })).EnsureSuccessStatusCode();
        var applicationId = await participant.ApplyAsync(created.Id);

        using var response = await organizer.GetAsync($"/events/{created.Id}/applications");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var page = await response.ReadAsAsync<PagedResponse<EventApplicationResponse>>();
        var application = page.Items.ShouldHaveSingleItem();
        application.Id.ShouldBe(applicationId);
        application.Status.ShouldBe(ApplicationStatus.Pending);
        application.Applicant.DisplayName.ShouldBe("Ola");
        application.Applicant.Bio.ShouldBe("Chess fan");
        application.Applicant.City.ShouldBe("Opole");
    }

    [Fact]
    public async Task Should_ReturnOnlyMatchingApplications_When_StatusIsGiven()
    {
        using var organizer = await factory.SignedInClientAsync();
        var created = await organizer.CreateEventAsync();
        using var accepted = await factory.SignedInClientAsync();
        var acceptedId = await accepted.ApplyAsync(created.Id);
        (await organizer.DecideAsync(acceptedId, "Accepted")).EnsureSuccessStatusCode();
        using var pending = await factory.SignedInClientAsync();
        var pendingId = await pending.ApplyAsync(created.Id);

        using var response = await organizer.GetAsync($"/events/{created.Id}/applications?status=Pending");

        var page = await response.ReadAsAsync<PagedResponse<EventApplicationResponse>>();
        page.TotalCount.ShouldBe(1);
        page.Items.ShouldHaveSingleItem().Id.ShouldBe(pendingId);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_UserIsNotOrganizer()
    {
        using var organizer = await factory.SignedInClientAsync();
        var created = await organizer.CreateEventAsync();
        using var participant = await factory.SignedInClientAsync();
        await participant.ApplyAsync(created.Id);

        using var response = await participant.GetAsync($"/events/{created.Id}/applications");

        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.NotOrganizer");
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_EventDoesNotExist()
    {
        using var organizer = await factory.SignedInClientAsync();

        using var response = await organizer.GetAsync($"/events/{Guid.CreateVersion7()}/applications");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.NotFound");
    }
}
