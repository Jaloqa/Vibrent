using MediatR;
using Microsoft.EntityFrameworkCore;
using Vibrent.Domain.Common;
using Vibrent.Domain.Users;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Users.UpdateProfile;

internal sealed class UpdateProfileHandler(AppDbContext dbContext)
    : IRequestHandler<UpdateProfileCommand, Result<ProfileResponse>>
{
    public async Task<Result<ProfileResponse>> Handle(UpdateProfileCommand command, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.SingleOrDefaultAsync(candidate => candidate.Id == command.UserId, cancellationToken);
        if (user is null)
        {
            return UserErrors.NotFound;
        }

        user.UpdateProfile(command.DisplayName.Trim(), Normalize(command.Bio), Normalize(command.City));
        await dbContext.SaveChangesAsync(cancellationToken);

        return new ProfileResponse(
            user.Id,
            user.Email,
            user.DisplayName,
            user.Bio,
            user.AvatarUrl,
            user.City,
            user.Role.ToString());
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
