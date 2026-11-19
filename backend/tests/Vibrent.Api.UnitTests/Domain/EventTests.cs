using Shouldly;
using Vibrent.Domain.Events;
using Vibrent.Domain.Swipes;
using static Vibrent.Api.UnitTests.Domain.DomainFactory;

namespace Vibrent.Api.UnitTests.Domain;

public sealed class EventTests
{
    [Fact]
    public void Should_CreateSwipe_When_UserLikesActiveEvent()
    {
        var @event = CreateEvent();
        var userId = Guid.CreateVersion7();

        var result = @event.RecordSwipe(userId, SwipeDecision.Like, Now);

        result.IsSuccess.ShouldBeTrue();
        result.Value.UserId.ShouldBe(userId);
        result.Value.EventId.ShouldBe(@event.Id);
        result.Value.Decision.ShouldBe(SwipeDecision.Like);
    }

    [Fact]
    public void Should_ReturnOwnEvent_When_OrganizerSwipesOwnEvent()
    {
        var @event = CreateEvent();

        var result = @event.RecordSwipe(OrganizerId, SwipeDecision.Like, Now);

        result.Error.ShouldBe(EventErrors.OwnEvent);
    }

    [Fact]
    public void Should_ReturnCancelled_When_SwipingCancelledEvent()
    {
        var @event = CreateEvent();
        @event.Cancel();

        var result = @event.RecordSwipe(Guid.CreateVersion7(), SwipeDecision.Like, Now);

        result.Error.ShouldBe(EventErrors.Cancelled);
    }

    [Fact]
    public void Should_ReturnFinished_When_SwipingEventThatAlreadyStarted()
    {
        var @event = CreateEvent(startsAt: Now.AddHours(-1));

        var result = @event.RecordSwipe(Guid.CreateVersion7(), SwipeDecision.Like, Now);

        result.Error.ShouldBe(EventErrors.Finished);
    }

    [Fact]
    public void Should_ReturnCapacityBelowAccepted_When_ReducingCapacityUnderAcceptedCount()
    {
        var @event = CreateEvent(capacity: 2);
        CreatePendingApplication(@event).Accept(@event, Now);
        CreatePendingApplication(@event).Accept(@event, Now);

        var result = @event.ChangeCapacity(1);

        result.Error.ShouldBe(EventErrors.CapacityBelowAccepted);
        @event.Capacity.ShouldBe(2);
    }

    [Fact]
    public void Should_ReturnCancelled_When_CancellingCancelledEvent()
    {
        var @event = CreateEvent();
        @event.Cancel();

        var result = @event.Cancel();

        result.Error.ShouldBe(EventErrors.Cancelled);
    }

    [Fact]
    public void Should_ReturnCancelled_When_UpdatingCancelledEvent()
    {
        var @event = CreateEvent();
        @event.Cancel();

        var result = @event.UpdateDetails(@event.CategoryId, "New title", @event.Description, @event.StartsAt, @event.Address, @event.Latitude, @event.Longitude, @event.ImageUrl);

        result.Error.ShouldBe(EventErrors.Cancelled);
        @event.Title.ShouldNotBe("New title");
    }
}
