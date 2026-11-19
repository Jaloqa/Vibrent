using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Common;

internal sealed class ActiveUserRequirement : IAuthorizationRequirement;

internal sealed class ActiveUserHandler(AppDbContext dbContext) : AuthorizationHandler<ActiveUserRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, ActiveUserRequirement requirement)
    {
        if (context.User.Identity?.IsAuthenticated != true)
        {
            return;
        }

        var userId = context.User.GetUserId();
        var cancellationToken = context.Resource is HttpContext httpContext ? httpContext.RequestAborted : CancellationToken.None;
        var isActive = await dbContext.Users.AnyAsync(user => user.Id == userId && !user.IsBlocked, cancellationToken);
        if (isActive)
        {
            context.Succeed(requirement);
        }
    }
}
