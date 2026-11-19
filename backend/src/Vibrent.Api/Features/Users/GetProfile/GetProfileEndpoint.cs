using System.Security.Claims;
using MediatR;
using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Users.GetProfile;

internal static class GetProfileEndpoint
{
    public static RouteHandlerBuilder MapGetProfile(this IEndpointRouteBuilder routes) => routes
        .MapGet("/me", async (ClaimsPrincipal principal, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new GetProfileQuery(principal.GetUserId()), cancellationToken);

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : result.Error!.ToProblem();
        })
        .WithName("GetMyProfile")
        .RequireAuthorization(AuthorizationPolicies.User)
        .Produces<ProfileResponse>()
        .ProducesProblem(StatusCodes.Status401Unauthorized);
}
