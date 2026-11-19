using System.Security.Claims;
using MediatR;
using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Applications.WithdrawApplication;

internal static class WithdrawApplicationEndpoint
{
    public static RouteHandlerBuilder MapWithdrawApplication(this IEndpointRouteBuilder routes) => routes
        .MapPatch("/{applicationId:guid}/withdraw", async (
            Guid applicationId,
            ClaimsPrincipal principal,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new WithdrawApplicationCommand(applicationId, principal.GetUserId()), cancellationToken);

            return result.IsSuccess
                ? Results.NoContent()
                : result.Error!.ToProblem();
        })
        .WithName("WithdrawApplication")
        .RequireAuthorization(AuthorizationPolicies.User)
        .Produces(StatusCodes.Status204NoContent)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesProblem(StatusCodes.Status409Conflict);
}
