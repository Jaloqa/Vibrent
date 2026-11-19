using MediatR;
using Vibrent.Domain.Common;

namespace Vibrent.Api.Features.Users.GetProfile;

public sealed record GetProfileQuery(Guid UserId) : IRequest<Result<ProfileResponse>>;
