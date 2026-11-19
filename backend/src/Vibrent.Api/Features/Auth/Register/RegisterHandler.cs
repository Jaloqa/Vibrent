using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Vibrent.Domain.Common;
using Vibrent.Domain.Users;
using Vibrent.Infrastructure.Authentication;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Auth.Register;

internal sealed class RegisterHandler(
    AppDbContext dbContext,
    IPasswordHasher<User> passwordHasher,
    JwtTokenGenerator tokenGenerator,
    TimeProvider timeProvider) : IRequestHandler<RegisterCommand, Result<AuthResponse>>
{
    public async Task<Result<AuthResponse>> Handle(RegisterCommand command, CancellationToken cancellationToken)
    {
        var email = User.NormalizeEmail(command.Email);
        if (await dbContext.Users.AnyAsync(user => user.Email == email, cancellationToken))
        {
            return AuthErrors.EmailTaken;
        }

        var user = User.Register(email, command.DisplayName.Trim(), timeProvider.GetUtcNow());
        user.ChangePasswordHash(passwordHasher.HashPassword(user, command.Password));

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        var token = tokenGenerator.Generate(user);

        return new AuthResponse(token.Value, token.ExpiresAt);
    }
}
