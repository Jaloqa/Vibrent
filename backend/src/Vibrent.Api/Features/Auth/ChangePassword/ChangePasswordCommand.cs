using MediatR;
using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Auth.ChangePassword;

public sealed record ChangePasswordCommand(Guid UserId, string CurrentPassword, string NewPassword) : IRequest<Result>;
