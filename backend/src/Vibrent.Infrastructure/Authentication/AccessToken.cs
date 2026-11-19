namespace Vibrent.Infrastructure.Authentication;

public sealed record AccessToken(string Value, DateTimeOffset ExpiresAt);
