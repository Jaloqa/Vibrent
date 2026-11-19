using Vibrent.Api.Features.Applications.ListEventApplications;

namespace Vibrent.Api.Features.Applications;

internal static class ApplicationsEndpoints
{
    public static IEndpointRouteBuilder MapApplicationsEndpoints(this IEndpointRouteBuilder routes)
    {
        var eventApplications = routes.MapGroup("/events").WithTags("Applications");
        eventApplications.MapListEventApplications();

        return routes;
    }
}
