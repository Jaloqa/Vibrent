using Vibrent.Api.Features.Applications.DecideApplication;
using Vibrent.Api.Features.Applications.ListEventApplications;
using Vibrent.Api.Features.Applications.ListMyApplications;

namespace Vibrent.Api.Features.Applications;

internal static class ApplicationsEndpoints
{
    public static IEndpointRouteBuilder MapApplicationsEndpoints(this IEndpointRouteBuilder routes)
    {
        var eventApplications = routes.MapGroup("/events").WithTags("Applications");
        eventApplications.MapListEventApplications();

        var applications = routes.MapGroup("/applications").WithTags("Applications");
        applications.MapDecideApplication();
        applications.MapListMyApplications();

        return routes;
    }
}
