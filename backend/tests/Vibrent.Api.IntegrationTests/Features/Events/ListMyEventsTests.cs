using System.Net;
using Shouldly;
using Vibrent.Api.Common;
using Vibrent.Api.Common.Pagination;
using Vibrent.Api.Features.Events.ListMyEvents;
using static Vibrent.Api.IntegrationTests.Features.Events.EventsTestData;

namespace Vibrent.Api.IntegrationTests.Features.Events;

[Collection(ApiFixtureDefinition.Name)]
public sealed class ListMyEventsTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_ReturnOnlyOwnEventsFromLatestStart_When_OrganizerHasEvents()
    {
        using var organizer = factory.CreateClient();
        organizer.Authorize(await organizer.RegisterAndGetTokenAsync());
        var sooner = await organizer.CreateEventAsync(ValidRequest(startsAt: DateTimeOffset.UtcNow.AddDays(1)));
        var later = await organizer.CreateEventAsync(ValidRequest(startsAt: DateTimeOffset.UtcNow.AddDays(2)));
        using var someoneElse = factory.CreateClient();
        someoneElse.Authorize(await someoneElse.RegisterAndGetTokenAsync());
        await someoneElse.CreateEventAsync();

        using var response = await organizer.GetAsync("/events/mine");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var page = await response.ReadAsAsync<PagedResponse<MyEventResponse>>();
        page.TotalCount.ShouldBe(2);
        page.Items.Select(item => item.Id).ShouldBe([later.Id, sooner.Id]);
        page.Items.ShouldAllBe(item => item.Status == EventState.Active);
    }

    [Fact]
    public async Task Should_ReportFreeSeatsAndPendingApplications_When_EventHasApplications()
    {
        using var organizer = factory.CreateClient();
        organizer.Authorize(await organizer.RegisterAndGetTokenAsync());
        var created = await organizer.CreateEventAsync(ValidRequest(capacity: 4));
        using var accepted = factory.CreateClient();
        accepted.Authorize(await accepted.RegisterAndGetTokenAsync());
        await factory.SeedApplicationAsync(created.Id, await accepted.GetMyIdAsync(), accept: true);
        using var pending = factory.CreateClient();
        pending.Authorize(await pending.RegisterAndGetTokenAsync());
        await factory.SeedApplicationAsync(created.Id, await pending.GetMyIdAsync());

        using var response = await organizer.GetAsync("/events/mine");

        var item = (await response.ReadAsAsync<PagedResponse<MyEventResponse>>()).Items.ShouldHaveSingleItem();
        item.AcceptedCount.ShouldBe(1);
        item.FreeSeats.ShouldBe(3);
        item.PendingApplications.ShouldBe(1);
    }

    [Fact]
    public async Task Should_ReturnRequestedPage_When_PageSizeIsSmallerThanTotal()
    {
        using var organizer = factory.CreateClient();
        organizer.Authorize(await organizer.RegisterAndGetTokenAsync());
        for (var day = 1; day <= 3; day++)
        {
            await organizer.CreateEventAsync(ValidRequest(startsAt: DateTimeOffset.UtcNow.AddDays(day)));
        }

        using var response = await organizer.GetAsync("/events/mine?page=2&pageSize=2");

        var page = await response.ReadAsAsync<PagedResponse<MyEventResponse>>();
        page.TotalCount.ShouldBe(3);
        page.Page.ShouldBe(2);
        page.Items.Count.ShouldBe(1);
    }

    [Fact]
    public async Task Should_ReturnValidationProblem_When_PageSizeIsAboveLimit()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());

        using var response = await client.GetAsync("/events/mine?pageSize=101");

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }
}
