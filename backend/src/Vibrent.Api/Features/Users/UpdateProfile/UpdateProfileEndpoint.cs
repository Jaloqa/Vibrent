using System.Security.Claims;
using MediatR;
using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Users.UpdateProfile;

internal static class UpdateProfileEndpoint
{
    public static RouteHandlerBuilder MapUpdateProfile(this IEndpointRouteBuilder routes) => routes
        .MapPut("/me", async (
            UpdateProfileRequest request,
            ClaimsPrincipal principal,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var command = new UpdateProfileCommand(principal.GetUserId(), request.DisplayName, request.Bio, request.City);
            var result = await sender.Send(command, cancellationToken);

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : result.Error!.ToProblem();
        })
        .WithName("UpdateMyProfile")
        .RequireAuthorization(AuthorizationPolicies.User)
        .Produces<ProfileResponse>()
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status401Unauthorized);

    public sealed record UpdateProfileRequest(string DisplayName, string? Bio, string? City);
}
