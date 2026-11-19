using System.Globalization;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Vibrent.Domain.Users;

namespace Vibrent.Infrastructure.Authentication;

public sealed class JwtTokenGenerator(IOptions<JwtOptions> options, TimeProvider timeProvider)
{
    private readonly JsonWebTokenHandler _handler = new();

    public AccessToken Generate(User user)
    {
        ArgumentNullException.ThrowIfNull(user);

        var jwt = options.Value;
        var issuedAt = timeProvider.GetUtcNow();
        var expiresAt = issuedAt.AddMinutes(jwt.ExpiryMinutes);

        var token = _handler.CreateToken(new SecurityTokenDescriptor
        {
            Issuer = jwt.Issuer,
            Audience = jwt.Audience,
            Subject = new ClaimsIdentity(
            [
                new Claim(VibrentClaimTypes.UserId, user.Id.ToString("D", CultureInfo.InvariantCulture)),
                new Claim(VibrentClaimTypes.Email, user.Email),
                new Claim(VibrentClaimTypes.Role, user.Role.ToString()),
            ]),
            IssuedAt = issuedAt.UtcDateTime,
            NotBefore = issuedAt.UtcDateTime,
            Expires = expiresAt.UtcDateTime,
            SigningCredentials = new SigningCredentials(CreateSigningKey(jwt.SigningKey), SecurityAlgorithms.HmacSha256),
        });

        return new AccessToken(token, expiresAt);
    }

    internal static SymmetricSecurityKey CreateSigningKey(string signingKey) => new(Encoding.UTF8.GetBytes(signingKey));
}
