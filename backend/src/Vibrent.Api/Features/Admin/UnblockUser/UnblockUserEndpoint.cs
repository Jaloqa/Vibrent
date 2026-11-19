using MediatR;
using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Admin.UnblockUser;

internal static class UnblockUserEndpoint
{
    public static RouteHandlerBuilder MapUnblockUser(this IEndpointRouteBuilder routes) => routes
        .MapPost("/users/{userId:guid}/unblock", async (Guid userId, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new UnblockUserCommand(userId), cancellationToken);

            return result.IsSuccess
                ? Results.NoContent()
                : result.Error!.ToProblem();
        })
        .WithName("UnblockUser")
        .RequireAuthorization(AuthorizationPolicies.Admin)
        .Produces(StatusCodes.Status204NoContent)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound);
}
