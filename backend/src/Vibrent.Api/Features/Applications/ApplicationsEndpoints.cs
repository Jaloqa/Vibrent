using Vibrent.Api.Features.Applications.DecideApplication;
using Vibrent.Api.Features.Applications.ListEventApplications;

namespace Vibrent.Api.Features.Applications;

internal static class ApplicationsEndpoints
{
    public static IEndpointRouteBuilder MapApplicationsEndpoints(this IEndpointRouteBuilder routes)
    {
        var eventApplications = routes.MapGroup("/events").WithTags("Applications");
        eventApplications.MapListEventApplications();

        var applications = routes.MapGroup("/applications").WithTags("Applications");
        applications.MapDecideApplication();

        return routes;
    }
}
