using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Auth;

internal static class AuthErrors
{
    public static readonly Error EmailTaken =
        Error.Conflict("Auth.EmailTaken", "An account with this email already exists.");
}
