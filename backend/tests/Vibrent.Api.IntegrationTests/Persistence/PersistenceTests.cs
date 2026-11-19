using Microsoft.EntityFrameworkCore;
using Npgsql;
using Shouldly;
using Vibrent.Domain.Applications;
using Vibrent.Domain.Events;
using Vibrent.Domain.Swipes;
using Vibrent.Domain.Users;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.IntegrationTests.Persistence;

[Collection(ApiFixtureDefinition.Name)]
public sealed class PersistenceTests(ApiFactory factory)
{
    private static readonly DateTimeOffset Now = new(2026, 11, 19, 12, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task Should_SeedCategories_When_DatabaseIsMigrated()
    {
        await using var dbContext = factory.CreateDbContext();

        (await dbContext.Categories.CountAsync()).ShouldBe(5);
    }

    [Fact]
    public async Task Should_AcceptOnlyOneApplication_When_LastSeatIsAcceptedConcurrently()
    {
        var (eventId, applicationIds) = await SeedEventWithPendingApplicationsAsync(capacity: 1, applicants: 2);

        await using var first = factory.CreateDbContext();
        await using var second = factory.CreateDbContext();
        var firstEvent = await first.Events.SingleAsync(e => e.Id == eventId);
        var secondEvent = await second.Events.SingleAsync(e => e.Id == eventId);
        var firstApplication = await first.Applications.SingleAsync(a => a.Id == applicationIds[0]);
        var secondApplication = await second.Applications.SingleAsync(a => a.Id == applicationIds[1]);

        firstApplication.Accept(firstEvent, Now).IsSuccess.ShouldBeTrue();
        secondApplication.Accept(secondEvent, Now).IsSuccess.ShouldBeTrue();
        await first.SaveChangesAsync();

        await Should.ThrowAsync<DbUpdateConcurrencyException>(() => second.SaveChangesAsync());

        await using var verification = factory.CreateDbContext();
        (await verification.Events.SingleAsync(e => e.Id == eventId)).AcceptedCount.ShouldBe(1);
        (await verification.Applications.CountAsync(a => a.EventId == eventId && a.Status == ApplicationStatus.Accepted))
            .ShouldBe(1);
    }

    [Fact]
    public async Task Should_RejectDuplicateApplication_When_SameUserAppliesTwice()
    {
        await using var dbContext = factory.CreateDbContext();
        var organizer = AddUser(dbContext);
        var applicant = AddUser(dbContext);
        var @event = AddEvent(dbContext, organizer, await AnyCategoryIdAsync(dbContext), capacity: 5);
        var swipe = @event.RecordSwipe(applicant.Id, SwipeDecision.Like, Now).Value;
        dbContext.Swipes.Add(swipe);
        dbContext.Applications.Add(EventApplication.FromLike(swipe, Now));
        await dbContext.SaveChangesAsync();

        dbContext.Applications.Add(EventApplication.FromLike(swipe, Now));

        var exception = await Should.ThrowAsync<DbUpdateException>(() => dbContext.SaveChangesAsync());
        exception.InnerException.ShouldBeOfType<PostgresException>().SqlState.ShouldBe(PostgresErrorCodes.UniqueViolation);
    }

    [Fact]
    public async Task Should_RejectAcceptedCountAboveCapacity_When_WrittenDirectly()
    {
        var (eventId, _) = await SeedEventWithPendingApplicationsAsync(capacity: 2, applicants: 0);
        await using var dbContext = factory.CreateDbContext();

        var exception = await Should.ThrowAsync<PostgresException>(() => dbContext.Events
            .Where(e => e.Id == eventId)
            .ExecuteUpdateAsync(setters => setters.SetProperty(e => e.AcceptedCount, e => e.Capacity + 1)));

        exception.SqlState.ShouldBe(PostgresErrorCodes.CheckViolation);
    }

    private async Task<(Guid EventId, Guid[] ApplicationIds)> SeedEventWithPendingApplicationsAsync(int capacity, int applicants)
    {
        await using var dbContext = factory.CreateDbContext();
        var organizer = AddUser(dbContext);
        var @event = AddEvent(dbContext, organizer, await AnyCategoryIdAsync(dbContext), capacity);

        var applicationIds = new Guid[applicants];
        for (var i = 0; i < applicants; i++)
        {
            var applicant = AddUser(dbContext);
            var swipe = @event.RecordSwipe(applicant.Id, SwipeDecision.Like, Now).Value;
            var application = EventApplication.FromLike(swipe, Now);
            dbContext.Swipes.Add(swipe);
            dbContext.Applications.Add(application);
            applicationIds[i] = application.Id;
        }

        await dbContext.SaveChangesAsync();

        return (@event.Id, applicationIds);
    }

    private static User AddUser(AppDbContext dbContext)
    {
        var user = User.Register($"{Guid.NewGuid():N}@vibrent.test", "Test user", Now);
        user.ChangePasswordHash("hash");
        dbContext.Users.Add(user);
        return user;
    }

    private static Event AddEvent(AppDbContext dbContext, User organizer, Guid categoryId, int capacity)
    {
        var @event = Event.Create(
            organizer.Id,
            categoryId,
            "Board games night",
            "Bring your favourite game.",
            Now.AddDays(7),
            "Opole, Rynek 1",
            50.6683,
            17.9231,
            capacity,
            imageUrl: null,
            Now);
        dbContext.Events.Add(@event);
        return @event;
    }

    private static Task<Guid> AnyCategoryIdAsync(AppDbContext dbContext) =>
        dbContext.Categories.Select(category => category.Id).FirstAsync();
}
