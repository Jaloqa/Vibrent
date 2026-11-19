using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Vibrent.Api.Features.Events;
using Vibrent.Domain.Applications;
using Vibrent.Domain.Events;
using Vibrent.Domain.Swipes;

namespace Vibrent.Api.IntegrationTests.Features.Events;

internal static class EventsTestData
{
    public static readonly Guid BoardGamesCategoryId = Guid.Parse("019a9c40-0000-7000-8000-000000000003");

    public static readonly Guid SportCategoryId = Guid.Parse("019a9c40-0000-7000-8000-000000000005");

    public static EventRequest ValidRequest(
        int capacity = 10,
        DateTimeOffset? startsAt = null,
        Guid? categoryId = null,
        string title = "Board games night") => new(
        categoryId ?? BoardGamesCategoryId,
        title,
        "Bring your favourite game.",
        startsAt ?? DateTimeOffset.UtcNow.AddDays(7),
        "Opole, Rynek 1",
        50.6683,
        17.9231,
        capacity);

    public static async Task<EventResponse> CreateEventAsync(this HttpClient client, EventRequest? request = null)
    {
        using var response = await client.PostAsJsonAsync("/events", request ?? ValidRequest(), ApiClientExtensions.JsonOptions);
        response.EnsureSuccessStatusCode();
        return await response.ReadAsAsync<EventResponse>();
    }

    public static async Task<Guid> SeedApplicationAsync(
        this ApiFactory factory,
        Guid eventId,
        Guid applicantId,
        bool accept = false)
    {
        var now = DateTimeOffset.UtcNow;
        await using var dbContext = factory.CreateDbContext();
        var @event = await dbContext.Events.SingleAsync(candidate => candidate.Id == eventId);
        var swipe = @event.RecordSwipe(applicantId, SwipeDecision.Like, now).Value;
        var application = EventApplication.FromLike(swipe, now);
        if (accept)
        {
            application.Accept(@event, now);
        }

        dbContext.Swipes.Add(swipe);
        dbContext.Applications.Add(application);
        await dbContext.SaveChangesAsync();

        return application.Id;
    }

    public static async Task<Guid> SeedStartedEventAsync(this ApiFactory factory, Guid organizerId)
    {
        var now = DateTimeOffset.UtcNow;
        await using var dbContext = factory.CreateDbContext();
        var @event = Event.Create(
            organizerId,
            BoardGamesCategoryId,
            "Yesterday's game night",
            "Already happened.",
            now.AddHours(-1),
            "Opole, Rynek 1",
            50.6683,
            17.9231,
            capacity: 5,
            imageUrl: null,
            now.AddDays(-3));
        dbContext.Events.Add(@event);
        await dbContext.SaveChangesAsync();

        return @event.Id;
    }
}
