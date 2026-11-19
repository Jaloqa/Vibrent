using MediatR;
using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Admin.UnblockUser;

public sealed record UnblockUserCommand(Guid UserId) : IRequest<Result>;
