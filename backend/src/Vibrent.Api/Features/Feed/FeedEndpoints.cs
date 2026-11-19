using Vibrent.Api.Features.Feed.GetFeed;

namespace Vibrent.Api.Features.Feed;

internal static class FeedEndpoints
{
    public static IEndpointRouteBuilder MapFeedEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/events").WithTags("Feed");

        group.MapGetFeed();

        return routes;
    }
}
