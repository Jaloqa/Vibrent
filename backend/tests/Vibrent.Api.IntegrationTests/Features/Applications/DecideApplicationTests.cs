using System.Net;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Vibrent.Api.Features.Applications.DecideApplication;
using Vibrent.Api.IntegrationTests.Features.Events;
using Vibrent.Domain.Applications;
using static Vibrent.Api.IntegrationTests.Features.Events.EventsTestData;

namespace Vibrent.Api.IntegrationTests.Features.Applications;

[Collection(ApiFixtureDefinition.Name)]
public sealed class DecideApplicationTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_AcceptApplicationAndTakeSeat_When_SeatsAreFree()
    {
        using var organizer = await factory.SignedInClientAsync();
        var created = await organizer.CreateEventAsync(ValidRequest(capacity: 2));
        using var participant = await factory.SignedInClientAsync();
        var applicationId = await participant.ApplyAsync(created.Id);

        using var response = await organizer.DecideAsync(applicationId, "Accepted");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var decision = await response.ReadAsAsync<ApplicationDecisionResponse>();
        decision.Status.ShouldBe(ApplicationStatus.Accepted);
        decision.EventFreeSeats.ShouldBe(1);
    }

    [Fact]
    public async Task Should_RejectApplicationWithoutTakingSeat_When_OrganizerRejects()
    {
        using var organizer = await factory.SignedInClientAsync();
        var created = await organizer.CreateEventAsync(ValidRequest(capacity: 2));
        using var participant = await factory.SignedInClientAsync();
        var applicationId = await participant.ApplyAsync(created.Id);

        using var response = await organizer.DecideAsync(applicationId, "Rejected");

        var decision = await response.ReadAsAsync<ApplicationDecisionResponse>();
        decision.Status.ShouldBe(ApplicationStatus.Rejected);
        decision.EventFreeSeats.ShouldBe(2);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_EventHasNoFreeSeats()
    {
        using var organizer = await factory.SignedInClientAsync();
        var created = await organizer.CreateEventAsync(ValidRequest(capacity: 1));
        using var first = await factory.SignedInClientAsync();
        var firstId = await first.ApplyAsync(created.Id);
        using var second = await factory.SignedInClientAsync();
        var secondId = await second.ApplyAsync(created.Id);
        (await organizer.DecideAsync(firstId, "Accepted")).EnsureSuccessStatusCode();

        using var response = await organizer.DecideAsync(secondId, "Accepted");

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.NoFreeSeats");
    }

    [Fact]
    public async Task Should_AcceptOnlyOne_When_LastSeatIsAcceptedConcurrently()
    {
        using var organizer = await factory.SignedInClientAsync();
        var created = await organizer.CreateEventAsync(ValidRequest(capacity: 1));
        using var first = await factory.SignedInClientAsync();
        var firstId = await first.ApplyAsync(created.Id);
        using var second = await factory.SignedInClientAsync();
        var secondId = await second.ApplyAsync(created.Id);

        var responses = await Task.WhenAll(organizer.DecideAsync(firstId, "Accepted"), organizer.DecideAsync(secondId, "Accepted"));

        responses.Select(response => response.StatusCode)
            .ShouldBe([HttpStatusCode.OK, HttpStatusCode.Conflict], ignoreOrder: true);
        await using var dbContext = factory.CreateDbContext();
        (await dbContext.Events.SingleAsync(@event => @event.Id == created.Id)).AcceptedCount.ShouldBe(1);
        (await dbContext.Applications.CountAsync(application =>
            application.EventId == created.Id && application.Status == ApplicationStatus.Accepted)).ShouldBe(1);
        foreach (var response in responses)
        {
            response.Dispose();
        }
    }

    [Fact]
    public async Task Should_ReturnNotPending_When_ApplicationWasAlreadyDecided()
    {
        using var organizer = await factory.SignedInClientAsync();
        var created = await organizer.CreateEventAsync();
        using var participant = await factory.SignedInClientAsync();
        var applicationId = await participant.ApplyAsync(created.Id);
        (await organizer.DecideAsync(applicationId, "Rejected")).EnsureSuccessStatusCode();

        using var response = await organizer.DecideAsync(applicationId, "Accepted");

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        (await response.ReadProblemCodeAsync()).ShouldBe("Application.NotPending");
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_ApplicantTriesToAcceptOwnApplication()
    {
        using var organizer = await factory.SignedInClientAsync();
        var created = await organizer.CreateEventAsync();
        using var participant = await factory.SignedInClientAsync();
        var applicationId = await participant.ApplyAsync(created.Id);

        using var response = await participant.DecideAsync(applicationId, "Accepted");

        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
        (await response.ReadProblemCodeAsync()).ShouldBe("Event.NotOrganizer");
    }

    [Fact]
    public async Task Should_ReturnValidationProblem_When_DecisionIsNotAcceptOrReject()
    {
        using var organizer = await factory.SignedInClientAsync();
        var created = await organizer.CreateEventAsync();
        using var participant = await factory.SignedInClientAsync();
        var applicationId = await participant.ApplyAsync(created.Id);

        using var response = await organizer.DecideAsync(applicationId, "Withdrawn");

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ApplicationDoesNotExist()
    {
        using var organizer = await factory.SignedInClientAsync();

        using var response = await organizer.DecideAsync(Guid.CreateVersion7(), "Accepted");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        (await response.ReadProblemCodeAsync()).ShouldBe("Application.NotFound");
    }
}
