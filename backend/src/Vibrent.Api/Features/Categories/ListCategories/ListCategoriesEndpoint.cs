using MediatR;
using Vibrent.Api.Common;

namespace Vibrent.Api.Features.Categories.ListCategories;

internal static class ListCategoriesEndpoint
{
    public static RouteHandlerBuilder MapListCategories(this IEndpointRouteBuilder routes) => routes
        .MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(new ListCategoriesQuery(), cancellationToken)))
        .WithName("ListCategories")
        .RequireAuthorization(AuthorizationPolicies.User)
        .Produces<IReadOnlyList<CategoryResponse>>()
        .ProducesProblem(StatusCodes.Status401Unauthorized);
}
