using MediatR;
using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Auth.Login;

internal static class LoginEndpoint
{
    public static RouteHandlerBuilder MapLogin(this IEndpointRouteBuilder routes) => routes
        .MapPost("/login", async (LoginCommand command, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(command, cancellationToken);

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : result.Error!.ToProblem();
        })
        .WithName("Login")
        .AllowAnonymous()
        .Produces<AuthResponse>()
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden);
}
