using System.Security.Claims;
using MediatR;
using Vibrent.Api.Common;
using Vibrent.Domain.Applications;

namespace Vibrent.Api.Features.Applications.DecideApplication;

internal static class DecideApplicationEndpoint
{
    public static RouteHandlerBuilder MapDecideApplication(this IEndpointRouteBuilder routes) => routes
        .MapPatch("/{applicationId:guid}", async (
            Guid applicationId,
            ApplicationDecisionRequest request,
            ClaimsPrincipal principal,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var command = new DecideApplicationCommand(applicationId, principal.GetUserId(), request.Status);
            var result = await sender.Send(command, cancellationToken);

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : result.Error!.ToProblem();
        })
        .WithName("DecideApplication")
        .RequireAuthorization(AuthorizationPolicies.User)
        .Produces<ApplicationDecisionResponse>()
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesProblem(StatusCodes.Status409Conflict);

    public sealed record ApplicationDecisionRequest(ApplicationStatus Status);
}
