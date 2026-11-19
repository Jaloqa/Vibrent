using Shouldly;
using Vibrent.Api.Common;
using Vibrent.Domain.Events;

namespace Vibrent.Api.UnitTests.Common;

public sealed class EventStateResolverTests
{
    private static readonly DateTimeOffset Now = new(2026, 11, 19, 12, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Should_ReturnActive_When_ActiveEventStartsLater()
    {
        EventStateResolver.Resolve(EventStatus.Active, Now.AddMinutes(1), Now).ShouldBe(EventState.Active);
    }

    [Fact]
    public void Should_ReturnFinished_When_ActiveEventAlreadyStarted()
    {
        EventStateResolver.Resolve(EventStatus.Active, Now, Now).ShouldBe(EventState.Finished);
    }

    [Fact]
    public void Should_ReturnCancelled_When_EventIsCancelledRegardlessOfDate()
    {
        EventStateResolver.Resolve(EventStatus.Cancelled, Now.AddDays(-1), Now).ShouldBe(EventState.Cancelled);
    }
}
