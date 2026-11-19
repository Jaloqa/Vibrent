using MediatR;
using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Users.UpdateProfile;

public sealed record UpdateProfileCommand(Guid UserId, string DisplayName, string? Bio, string? City)
    : IRequest<Result<ProfileResponse>>;
