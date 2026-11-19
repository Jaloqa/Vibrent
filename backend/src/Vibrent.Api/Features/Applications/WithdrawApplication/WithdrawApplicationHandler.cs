using MediatR;
using Microsoft.EntityFrameworkCore;
using Vibrent.Domain.Applications;
using Vibrent.Domain.Common;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Applications.WithdrawApplication;

internal sealed class WithdrawApplicationHandler(AppDbContext dbContext) : IRequestHandler<WithdrawApplicationCommand, Result>
{
    public async Task<Result> Handle(WithdrawApplicationCommand command, CancellationToken cancellationToken)
    {
        var application = await dbContext.Applications
            .SingleOrDefaultAsync(candidate => candidate.Id == command.ApplicationId, cancellationToken);
        if (application is null)
        {
            return ApplicationErrors.NotFound;
        }

        if (application.UserId != command.UserId)
        {
            return ApplicationErrors.NotApplicant;
        }

        var @event = await dbContext.Events.SingleAsync(candidate => candidate.Id == application.EventId, cancellationToken);
        var result = application.Withdraw(@event);
        if (result.IsFailure)
        {
            return result;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
