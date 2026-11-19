using Vibrent.Domain.Common;

namespace Vibrent.Domain.Users;

public static class UserErrors
{
    public static readonly Error NotFound =
        Error.NotFound("User.NotFound", "The user does not exist.");

    public static readonly Error CannotBlockAdmin =
        Error.Conflict("User.CannotBlockAdmin", "Administrators cannot be blocked.");
}
