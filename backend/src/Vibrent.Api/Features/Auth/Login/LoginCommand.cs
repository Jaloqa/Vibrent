using MediatR;
using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Auth.Login;

public sealed record LoginCommand(string Email, string Password) : IRequest<Result<AuthResponse>>;
