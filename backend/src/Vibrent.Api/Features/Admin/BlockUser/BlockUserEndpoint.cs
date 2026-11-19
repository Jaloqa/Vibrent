using MediatR;
using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Admin.BlockUser;

internal static class BlockUserEndpoint
{
    public static RouteHandlerBuilder MapBlockUser(this IEndpointRouteBuilder routes) => routes
        .MapPost("/users/{userId:guid}/block", async (Guid userId, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new BlockUserCommand(userId), cancellationToken);

            return result.IsSuccess
                ? Results.NoContent()
                : result.Error!.ToProblem();
        })
        .WithName("BlockUser")
        .RequireAuthorization(AuthorizationPolicies.Admin)
        .Produces(StatusCodes.Status204NoContent)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesProblem(StatusCodes.Status409Conflict);
}
