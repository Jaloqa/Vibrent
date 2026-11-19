using Vibrent.Api.Features.Categories.ListCategories;

namespace Vibrent.Api.Features.Categories;

internal static class CategoriesEndpoints
{
    public static IEndpointRouteBuilder MapCategoriesEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/categories").WithTags("Categories");

        group.MapListCategories();

        return routes;
    }
}
