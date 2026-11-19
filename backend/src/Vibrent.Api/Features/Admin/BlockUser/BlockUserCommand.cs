using MediatR;
using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Admin.BlockUser;

public sealed record BlockUserCommand(Guid UserId) : IRequest<Result>;
