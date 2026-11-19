using Vibrent.Api.Features.Swipes.SwipeEvent;

namespace Vibrent.Api.Features.Swipes;

internal static class SwipesEndpoints
{
    public static IEndpointRouteBuilder MapSwipesEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/events").WithTags("Swipes");

        group.MapSwipeEvent();

        return routes;
    }
}
