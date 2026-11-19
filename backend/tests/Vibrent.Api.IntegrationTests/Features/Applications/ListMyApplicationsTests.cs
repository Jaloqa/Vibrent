using System.Net;
using Shouldly;
using Vibrent.Api.Common;
using Vibrent.Api.Common.Pagination;
using Vibrent.Api.Features.Applications.ListMyApplications;
using Vibrent.Api.IntegrationTests.Features.Events;
using Vibrent.Domain.Applications;
using static Vibrent.Api.IntegrationTests.Features.Events.EventsTestData;

namespace Vibrent.Api.IntegrationTests.Features.Applications;

[Collection(ApiFixtureDefinition.Name)]
public sealed class ListMyApplicationsTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_ReturnOwnApplicationsFromNewestWithEventDetails_When_UserApplied()
    {
        using var organizer = await factory.SignedInClientAsync();
        var older = await organizer.CreateEventAsync(ValidRequest(title: "Chess"));
        var newer = await organizer.CreateEventAsync(ValidRequest(title: "Running"));
        using var participant = await factory.SignedInClientAsync();
        await participant.ApplyAsync(older.Id);
        await participant.ApplyAsync(newer.Id);
        using var someoneElse = await factory.SignedInClientAsync();
        await someoneElse.ApplyAsync(older.Id);

        using var response = await participant.GetAsync("/applications/mine");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var page = await response.ReadAsAsync<PagedResponse<MyApplicationResponse>>();
        page.TotalCount.ShouldBe(2);
        page.Items.Select(item => item.EventTitle).ShouldBe(["Running", "Chess"]);
        page.Items.ShouldAllBe(item => item.Status == ApplicationStatus.Pending && item.EventStatus == EventState.Active);
    }

    [Fact]
    public async Task Should_ShowCancelledEventStatus_When_OrganizerCancelledEvent()
    {
        using var organizer = await factory.SignedInClientAsync();
        var created = await organizer.CreateEventAsync();
        using var participant = await factory.SignedInClientAsync();
        await participant.ApplyAsync(created.Id);
        (await organizer.PostAsync($"/events/{created.Id}/cancel", content: null)).EnsureSuccessStatusCode();

        using var response = await participant.GetAsync("/applications/mine");

        (await response.ReadAsAsync<PagedResponse<MyApplicationResponse>>()).Items
            .ShouldHaveSingleItem().EventStatus.ShouldBe(EventState.Cancelled);
    }

    [Fact]
    public async Task Should_ReturnOnlyMatchingApplications_When_StatusIsGiven()
    {
        using var organizer = await factory.SignedInClientAsync();
        var accepted = await organizer.CreateEventAsync();
        var pending = await organizer.CreateEventAsync();
        using var participant = await factory.SignedInClientAsync();
        var acceptedId = await participant.ApplyAsync(accepted.Id);
        await participant.ApplyAsync(pending.Id);
        (await organizer.DecideAsync(acceptedId, "Accepted")).EnsureSuccessStatusCode();

        using var response = await participant.GetAsync("/applications/mine?status=Accepted");

        var item = (await response.ReadAsAsync<PagedResponse<MyApplicationResponse>>()).Items.ShouldHaveSingleItem();
        item.Id.ShouldBe(acceptedId);
        item.DecidedAt.ShouldNotBeNull();
    }
}
