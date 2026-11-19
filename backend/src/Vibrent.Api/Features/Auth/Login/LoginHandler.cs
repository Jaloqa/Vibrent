using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Vibrent.Domain.Common;
using Vibrent.Domain.Users;
using Vibrent.Infrastructure.Authentication;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Auth.Login;

internal sealed class LoginHandler(
    AppDbContext dbContext,
    IPasswordHasher<User> passwordHasher,
    JwtTokenGenerator tokenGenerator) : IRequestHandler<LoginCommand, Result<AuthResponse>>
{
    public async Task<Result<AuthResponse>> Handle(LoginCommand command, CancellationToken cancellationToken)
    {
        var email = User.NormalizeEmail(command.Email);
        var user = await dbContext.Users.SingleOrDefaultAsync(candidate => candidate.Email == email, cancellationToken);
        if (user is null)
        {
            return AuthErrors.InvalidCredentials;
        }

        var verification = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, command.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            return AuthErrors.InvalidCredentials;
        }

        if (user.IsBlocked)
        {
            return AuthErrors.UserBlocked;
        }

        if (verification == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.ChangePasswordHash(passwordHasher.HashPassword(user, command.Password));
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        var token = tokenGenerator.Generate(user);

        return new AuthResponse(token.Value, token.ExpiresAt);
    }
}
