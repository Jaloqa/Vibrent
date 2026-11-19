using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Swipes;

internal static class SwipeErrors
{
    public static readonly Error AlreadySwiped =
        Error.Conflict("Swipe.AlreadySwiped", "You have already swiped this event.");
}
