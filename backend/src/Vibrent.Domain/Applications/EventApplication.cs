using Vibrent.Domain.Common;
using Vibrent.Domain.Events;
using Vibrent.Domain.Swipes;

namespace Vibrent.Domain.Applications;

public sealed class EventApplication
{
    private EventApplication()
    {
    }

    public Guid Id { get; private set; }

    public Guid UserId { get; private set; }

    public Guid EventId { get; private set; }

    public ApplicationStatus Status { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; }

    public DateTimeOffset? DecidedAt { get; private set; }

    public static EventApplication FromLike(Swipe swipe, DateTimeOffset now)
    {
        ArgumentNullException.ThrowIfNull(swipe);

        if (swipe.Decision != SwipeDecision.Like)
        {
            throw new ArgumentException("Only a like creates an application.", nameof(swipe));
        }

        return new EventApplication
        {
            Id = Guid.CreateVersion7(now),
            UserId = swipe.UserId,
            EventId = swipe.EventId,
            Status = ApplicationStatus.Pending,
            CreatedAt = now,
        };
    }

    public Result Accept(Event forEvent, DateTimeOffset now)
    {
        EnsureBelongsTo(forEvent);

        if (Status != ApplicationStatus.Pending)
        {
            return ApplicationErrors.NotPending;
        }

        var reservation = forEvent.ReserveSeat();
        if (reservation.IsFailure)
        {
            return reservation;
        }

        Status = ApplicationStatus.Accepted;
        DecidedAt = now;

        return Result.Success();
    }

    public Result Reject(DateTimeOffset now)
    {
        if (Status != ApplicationStatus.Pending)
        {
            return ApplicationErrors.NotPending;
        }

        Status = ApplicationStatus.Rejected;
        DecidedAt = now;

        return Result.Success();
    }

    public Result Withdraw(Event forEvent)
    {
        EnsureBelongsTo(forEvent);

        if (Status is not (ApplicationStatus.Pending or ApplicationStatus.Accepted))
        {
            return ApplicationErrors.CannotWithdraw;
        }

        if (Status == ApplicationStatus.Accepted)
        {
            forEvent.ReleaseSeat();
        }

        Status = ApplicationStatus.Withdrawn;

        return Result.Success();
    }

    private void EnsureBelongsTo(Event forEvent)
    {
        ArgumentNullException.ThrowIfNull(forEvent);

        if (forEvent.Id != EventId)
        {
            throw new ArgumentException("The application does not belong to this event.", nameof(forEvent));
        }
    }
}
