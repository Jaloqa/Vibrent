using MediatR;
using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Auth.Register;

public sealed record RegisterCommand(string Email, string Password, string DisplayName) : IRequest<Result<AuthResponse>>;
