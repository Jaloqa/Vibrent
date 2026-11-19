using MediatR;
using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Auth.Register;

internal static class RegisterEndpoint
{
    public static RouteHandlerBuilder MapRegister(this IEndpointRouteBuilder routes) => routes
        .MapPost("/register", async (RegisterCommand command, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(command, cancellationToken);

            return result.IsSuccess
                ? Results.Created("/users/me", result.Value)
                : result.Error!.ToProblem();
        })
        .WithName("Register")
        .AllowAnonymous()
        .Produces<AuthResponse>(StatusCodes.Status201Created)
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status409Conflict);
}
