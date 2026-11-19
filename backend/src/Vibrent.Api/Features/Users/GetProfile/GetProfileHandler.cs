using MediatR;
using Microsoft.EntityFrameworkCore;
using Vibrent.Domain.Common;
using Vibrent.Domain.Users;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Users.GetProfile;

internal sealed class GetProfileHandler(AppDbContext dbContext) : IRequestHandler<GetProfileQuery, Result<ProfileResponse>>
{
    public async Task<Result<ProfileResponse>> Handle(GetProfileQuery query, CancellationToken cancellationToken)
    {
        var profile = await dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == query.UserId)
            .Select(user => new ProfileResponse(
                user.Id,
                user.Email,
                user.DisplayName,
                user.Bio,
                user.AvatarUrl,
                user.City,
                user.Role.ToString()))
            .SingleOrDefaultAsync(cancellationToken);

        return profile is null ? UserErrors.NotFound : profile;
    }
}
