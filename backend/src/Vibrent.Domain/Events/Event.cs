using Vibrent.Domain.Common;
using Vibrent.Domain.Swipes;

namespace Vibrent.Domain.Events;

public sealed class Event
{
    private Event()
    {
    }

    public Guid Id { get; private set; }

    public Guid OrganizerId { get; private set; }

    public Guid CategoryId { get; private set; }

    public string Title { get; private set; } = string.Empty;

    public string Description { get; private set; } = string.Empty;

    public DateTimeOffset StartsAt { get; private set; }

    public string Address { get; private set; } = string.Empty;

    public double Latitude { get; private set; }

    public double Longitude { get; private set; }

    public int Capacity { get; private set; }

    public int AcceptedCount { get; private set; }

    public string? ImageUrl { get; private set; }

    public EventStatus Status { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; }

    public int FreeSeats => Capacity - AcceptedCount;

    public static Event Create(
        Guid organizerId,
        Guid categoryId,
        string title,
        string description,
        DateTimeOffset startsAt,
        string address,
        double latitude,
        double longitude,
        int capacity,
        string? imageUrl,
        DateTimeOffset now)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(capacity);

        return new Event
        {
            Id = Guid.CreateVersion7(now),
            OrganizerId = organizerId,
            CategoryId = categoryId,
            Title = title,
            Description = description,
            StartsAt = startsAt,
            Address = address,
            Latitude = latitude,
            Longitude = longitude,
            Capacity = capacity,
            ImageUrl = imageUrl,
            Status = EventStatus.Active,
            CreatedAt = now,
        };
    }

    public bool IsFinished(DateTimeOffset now) => StartsAt <= now;

    public Result UpdateDetails(
        Guid categoryId,
        string title,
        string description,
        DateTimeOffset startsAt,
        string address,
        double latitude,
        double longitude,
        string? imageUrl,
        DateTimeOffset now)
    {
        if (Status == EventStatus.Cancelled)
        {
            return EventErrors.Cancelled;
        }

        if (IsFinished(now))
        {
            return EventErrors.Finished;
        }

        CategoryId = categoryId;
        Title = title;
        Description = description;
        StartsAt = startsAt;
        Address = address;
        Latitude = latitude;
        Longitude = longitude;
        ImageUrl = imageUrl;

        return Result.Success();
    }

    public Result ChangeCapacity(int capacity)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(capacity);

        if (Status == EventStatus.Cancelled)
        {
            return EventErrors.Cancelled;
        }

        if (capacity < AcceptedCount)
        {
            return EventErrors.CapacityBelowAccepted;
        }

        Capacity = capacity;

        return Result.Success();
    }

    public Result Cancel()
    {
        if (Status == EventStatus.Cancelled)
        {
            return EventErrors.Cancelled;
        }

        Status = EventStatus.Cancelled;

        return Result.Success();
    }

    public Result<Swipe> RecordSwipe(Guid userId, SwipeDecision decision, DateTimeOffset now)
    {
        if (userId == OrganizerId)
        {
            return EventErrors.OwnEvent;
        }

        if (Status == EventStatus.Cancelled)
        {
            return EventErrors.Cancelled;
        }

        if (IsFinished(now))
        {
            return EventErrors.Finished;
        }

        if (decision == SwipeDecision.Like && FreeSeats == 0)
        {
            return EventErrors.NoFreeSeats;
        }

        return Swipe.Create(userId, Id, decision, now);
    }

    internal Result ReserveSeat()
    {
        if (Status == EventStatus.Cancelled)
        {
            return EventErrors.Cancelled;
        }

        if (AcceptedCount >= Capacity)
        {
            return EventErrors.NoFreeSeats;
        }

        AcceptedCount++;

        return Result.Success();
    }

    internal void ReleaseSeat()
    {
        if (AcceptedCount == 0)
        {
            throw new InvalidOperationException("The event has no accepted seat to release.");
        }

        AcceptedCount--;
    }
}
