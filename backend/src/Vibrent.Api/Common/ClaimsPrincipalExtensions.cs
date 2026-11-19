using System.Globalization;
using System.Security.Claims;
using Vibrent.Infrastructure.Authentication;

namespace Vibrent.Api.Common;

internal static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal) => Guid.Parse(
        principal.FindFirstValue(VibrentClaimTypes.UserId)
            ?? throw new InvalidOperationException("The access token has no user id claim."),
        CultureInfo.InvariantCulture);
}
