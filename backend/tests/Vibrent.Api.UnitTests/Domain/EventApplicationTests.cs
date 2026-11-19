using Shouldly;
using Vibrent.Domain.Applications;
using Vibrent.Domain.Events;
using Vibrent.Domain.Swipes;
using static Vibrent.Api.UnitTests.Domain.DomainFactory;

namespace Vibrent.Api.UnitTests.Domain;

public sealed class EventApplicationTests
{
    [Fact]
    public void Should_CreatePendingApplication_When_UserLikesEvent()
    {
        var @event = CreateEvent();

        var application = CreatePendingApplication(@event);

        application.Status.ShouldBe(ApplicationStatus.Pending);
        application.EventId.ShouldBe(@event.Id);
    }

    [Fact]
    public void Should_Throw_When_CreatingApplicationFromDislike()
    {
        var @event = CreateEvent();
        var dislike = @event.RecordSwipe(Guid.CreateVersion7(), SwipeDecision.Dislike, Now).Value;

        Should.Throw<ArgumentException>(() => EventApplication.FromLike(dislike, Now));
    }

    [Fact]
    public void Should_AcceptAndTakeSeat_When_PendingAndSeatsAreFree()
    {
        var @event = CreateEvent(capacity: 2);
        var application = CreatePendingApplication(@event);

        var result = application.Accept(@event, Now);

        result.IsSuccess.ShouldBeTrue();
        application.Status.ShouldBe(ApplicationStatus.Accepted);
        application.DecidedAt.ShouldBe(Now);
        @event.AcceptedCount.ShouldBe(1);
        @event.FreeSeats.ShouldBe(1);
    }

    [Fact]
    public void Should_ReturnNoFreeSeats_When_AcceptingWithEventFull()
    {
        var @event = CreateEvent(capacity: 1);
        CreatePendingApplication(@event).Accept(@event, Now);
        var application = CreatePendingApplication(@event);

        var result = application.Accept(@event, Now);

        result.Error.ShouldBe(EventErrors.NoFreeSeats);
        application.Status.ShouldBe(ApplicationStatus.Pending);
        @event.AcceptedCount.ShouldBe(1);
    }

    [Fact]
    public void Should_ReturnCancelled_When_AcceptingForCancelledEvent()
    {
        var @event = CreateEvent();
        var application = CreatePendingApplication(@event);
        @event.Cancel();

        var result = application.Accept(@event, Now);

        result.Error.ShouldBe(EventErrors.Cancelled);
        application.Status.ShouldBe(ApplicationStatus.Pending);
    }

    [Fact]
    public void Should_ReturnNotPending_When_AcceptingAlreadyAcceptedApplication()
    {
        var @event = CreateEvent(capacity: 2);
        var application = CreatePendingApplication(@event);
        application.Accept(@event, Now);

        var result = application.Accept(@event, Now);

        result.Error.ShouldBe(ApplicationErrors.NotPending);
        @event.AcceptedCount.ShouldBe(1);
    }

    [Fact]
    public void Should_Throw_When_AcceptingApplicationOfAnotherEvent()
    {
        var application = CreatePendingApplication(CreateEvent());

        Should.Throw<ArgumentException>(() => application.Accept(CreateEvent(), Now));
    }

    [Fact]
    public void Should_Reject_When_Pending()
    {
        var application = CreatePendingApplication(CreateEvent());

        var result = application.Reject(Now);

        result.IsSuccess.ShouldBeTrue();
        application.Status.ShouldBe(ApplicationStatus.Rejected);
        application.DecidedAt.ShouldBe(Now);
    }

    [Fact]
    public void Should_ReturnNotPending_When_RejectingAcceptedApplication()
    {
        var @event = CreateEvent();
        var application = CreatePendingApplication(@event);
        application.Accept(@event, Now);

        var result = application.Reject(Now);

        result.Error.ShouldBe(ApplicationErrors.NotPending);
        application.Status.ShouldBe(ApplicationStatus.Accepted);
    }

    [Fact]
    public void Should_FreeSeat_When_WithdrawingAcceptedApplication()
    {
        var @event = CreateEvent(capacity: 1);
        var application = CreatePendingApplication(@event);
        application.Accept(@event, Now);

        var result = application.Withdraw(@event);

        result.IsSuccess.ShouldBeTrue();
        application.Status.ShouldBe(ApplicationStatus.Withdrawn);
        @event.AcceptedCount.ShouldBe(0);
    }

    [Fact]
    public void Should_KeepSeatsUnchanged_When_WithdrawingPendingApplication()
    {
        var @event = CreateEvent(capacity: 2);
        CreatePendingApplication(@event).Accept(@event, Now);
        var application = CreatePendingApplication(@event);

        var result = application.Withdraw(@event);

        result.IsSuccess.ShouldBeTrue();
        application.Status.ShouldBe(ApplicationStatus.Withdrawn);
        @event.AcceptedCount.ShouldBe(1);
    }

    [Fact]
    public void Should_ReturnCannotWithdraw_When_WithdrawingRejectedApplication()
    {
        var @event = CreateEvent();
        var application = CreatePendingApplication(@event);
        application.Reject(Now);

        var result = application.Withdraw(@event);

        result.Error.ShouldBe(ApplicationErrors.CannotWithdraw);
        application.Status.ShouldBe(ApplicationStatus.Rejected);
    }
}
