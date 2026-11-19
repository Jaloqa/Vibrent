namespace Vibrent.Api.Features.Users;

public sealed record ProfileResponse(
    Guid Id,
    string Email,
    string DisplayName,
    string? Bio,
    string? AvatarUrl,
    string? City,
    string Role);
