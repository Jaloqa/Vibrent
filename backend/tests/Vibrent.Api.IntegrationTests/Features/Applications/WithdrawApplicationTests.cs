using System.Net;
using Shouldly;
using Vibrent.Api.Features.Events;
using Vibrent.Api.IntegrationTests.Features.Events;
using static Vibrent.Api.IntegrationTests.Features.Events.EventsTestData;

namespace Vibrent.Api.IntegrationTests.Features.Applications;

[Collection(ApiFixtureDefinition.Name)]
public sealed class WithdrawApplicationTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_WithdrawApplication_When_ItIsPending()
    {
        using var organizer = await factory.SignedInClientAsync();
        var created = await organizer.CreateEventAsync();
        using var participant = await factory.SignedInClientAsync();
        var applicationId = await participant.ApplyAsync(created.Id);

        using var response = await participant.WithdrawAsync(applicationId);

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        using var decision = await organizer.DecideAsync(applicationId, "Accepted");
        (await decision.ReadProblemCodeAsync()).ShouldBe("Application.NotPending");
    }

    [Fact]
    public async Task Should_FreeSeat_When_AcceptedApplicationIsWithdrawn()
    {
        using var organizer = await factory.SignedInClientAsync();
        var created = await organizer.CreateEventAsync(ValidRequest(capacity: 1));
        using var participant = await factory.SignedInClientAsync();
        var applicationId = await participant.ApplyAsync(created.Id);
        (await organizer.DecideAsync(applicationId, "Accepted")).EnsureSuccessStatusCode();

        using var response = await participant.WithdrawAsync(applicationId);

        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        using var details = await organizer.GetAsync($"/events/{created.Id}");
        var @event = await details.ReadAsAsync<EventResponse>();
        @event.AcceptedCount.ShouldBe(0);
        @event.FreeSeats.ShouldBe(1);
    }

    [Fact]
    public async Task Should_ReturnCannotWithdraw_When_ApplicationWasRejected()
    {
        using var organizer = await factory.SignedInClientAsync();
        var created = await organizer.CreateEventAsync();
        using var participant = await factory.SignedInClientAsync();
        var applicationId = await participant.ApplyAsync(created.Id);
        (await organizer.DecideAsync(applicationId, "Rejected")).EnsureSuccessStatusCode();

        using var response = await participant.WithdrawAsync(applicationId);

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        (await response.ReadProblemCodeAsync()).ShouldBe("Application.CannotWithdraw");
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_UserIsNotApplicant()
    {
        using var organizer = await factory.SignedInClientAsync();
        var created = await organizer.CreateEventAsync();
        using var participant = await factory.SignedInClientAsync();
        var applicationId = await participant.ApplyAsync(created.Id);

        using var response = await organizer.WithdrawAsync(applicationId);

        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
        (await response.ReadProblemCodeAsync()).ShouldBe("Application.NotApplicant");
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ApplicationDoesNotExist()
    {
        using var participant = await factory.SignedInClientAsync();

        using var response = await participant.WithdrawAsync(Guid.CreateVersion7());

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        (await response.ReadProblemCodeAsync()).ShouldBe("Application.NotFound");
    }
}
