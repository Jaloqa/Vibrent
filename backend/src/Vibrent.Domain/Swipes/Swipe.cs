namespace Vibrent.Domain.Swipes;

public sealed class Swipe
{
    private Swipe()
    {
    }

    public Guid Id { get; private set; }

    public Guid UserId { get; private set; }

    public Guid EventId { get; private set; }

    public SwipeDecision Decision { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; }

    internal static Swipe Create(Guid userId, Guid eventId, SwipeDecision decision, DateTimeOffset now) => new()
    {
        Id = Guid.CreateVersion7(now),
        UserId = userId,
        EventId = eventId,
        Decision = decision,
        CreatedAt = now,
    };
}
