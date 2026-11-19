using Vibrent.Domain.Users;

namespace Vibrent.Api.Features.Admin.ListUsers;

public sealed record AdminUserResponse(
    Guid Id,
    string Email,
    string DisplayName,
    UserRole Role,
    bool IsBlocked,
    DateTimeOffset CreatedAt);
