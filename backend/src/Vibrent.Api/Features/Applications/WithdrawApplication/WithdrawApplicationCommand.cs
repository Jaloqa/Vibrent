using MediatR;
using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Applications.WithdrawApplication;

public sealed record WithdrawApplicationCommand(Guid ApplicationId, Guid UserId) : IRequest<Result>;
