using MediatR;
using Microsoft.EntityFrameworkCore;
using Vibrent.Domain.Common;
using Vibrent.Domain.Users;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Admin.UnblockUser;

internal sealed class UnblockUserHandler(AppDbContext dbContext) : IRequestHandler<UnblockUserCommand, Result>
{
    public async Task<Result> Handle(UnblockUserCommand command, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.SingleOrDefaultAsync(candidate => candidate.Id == command.UserId, cancellationToken);
        if (user is null)
        {
            return UserErrors.NotFound;
        }

        user.Unblock();
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
