using Vibrent.Domain.Applications;
using Vibrent.Domain.Events;
using Vibrent.Domain.Swipes;

namespace Vibrent.Api.UnitTests.Domain;

internal static class DomainFactory
{
    public static readonly DateTimeOffset Now = new(2026, 11, 19, 12, 0, 0, TimeSpan.Zero);

    public static readonly Guid OrganizerId = Guid.CreateVersion7();

    public static Event CreateEvent(int capacity = 2, DateTimeOffset? startsAt = null) => Event.Create(
        OrganizerId,
        Guid.CreateVersion7(),
        "Board games night",
        "Bring your favourite game.",
        startsAt ?? Now.AddDays(7),
        "Opole, Rynek 1",
        50.6683,
        17.9231,
        capacity,
        imageUrl: null,
        Now);

    public static EventApplication CreatePendingApplication(Event forEvent)
    {
        var swipe = forEvent.RecordSwipe(Guid.CreateVersion7(), SwipeDecision.Like, Now).Value;
        return EventApplication.FromLike(swipe, Now);
    }
}
