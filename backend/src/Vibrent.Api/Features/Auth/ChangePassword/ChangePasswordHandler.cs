using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Vibrent.Domain.Common;
using Vibrent.Domain.Users;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Auth.ChangePassword;

internal sealed class ChangePasswordHandler(
    AppDbContext dbContext,
    IPasswordHasher<User> passwordHasher) : IRequestHandler<ChangePasswordCommand, Result>
{
    public async Task<Result> Handle(ChangePasswordCommand command, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.SingleOrDefaultAsync(candidate => candidate.Id == command.UserId, cancellationToken);
        if (user is null)
        {
            return UserErrors.NotFound;
        }

        if (passwordHasher.VerifyHashedPassword(user, user.PasswordHash, command.CurrentPassword) == PasswordVerificationResult.Failed)
        {
            return AuthErrors.InvalidCurrentPassword;
        }

        user.ChangePasswordHash(passwordHasher.HashPassword(user, command.NewPassword));
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
