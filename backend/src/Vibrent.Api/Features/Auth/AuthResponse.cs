namespace Vibrent.Api.Features.Auth;

public sealed record AuthResponse(string AccessToken, DateTimeOffset ExpiresAt);
