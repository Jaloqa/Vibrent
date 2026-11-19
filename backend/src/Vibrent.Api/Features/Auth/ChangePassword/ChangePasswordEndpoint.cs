using System.Security.Claims;
using MediatR;
using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Auth.ChangePassword;

internal static class ChangePasswordEndpoint
{
    public static RouteHandlerBuilder MapChangePassword(this IEndpointRouteBuilder routes) => routes
        .MapPut("/change-password", async (
            ChangePasswordRequest request,
            ClaimsPrincipal principal,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var command = new ChangePasswordCommand(principal.GetUserId(), request.CurrentPassword, request.NewPassword);
            var result = await sender.Send(command, cancellationToken);

            return result.IsSuccess
                ? Results.NoContent()
                : result.Error!.ToProblem();
        })
        .WithName("ChangePassword")
        .RequireAuthorization(AuthorizationPolicies.User)
        .Produces(StatusCodes.Status204NoContent)
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status401Unauthorized);

    public sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword);
}
