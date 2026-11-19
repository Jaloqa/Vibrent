using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Auth;

internal static class AuthErrors
{
    public static readonly Error EmailTaken =
        Error.Conflict("Auth.EmailTaken", "An account with this email already exists.");

    public static readonly Error InvalidCredentials =
        Error.Unauthorized("Auth.InvalidCredentials", "Email or password is incorrect.");

    public static readonly Error UserBlocked =
        Error.Forbidden("Auth.UserBlocked", "This account is blocked.");
}
