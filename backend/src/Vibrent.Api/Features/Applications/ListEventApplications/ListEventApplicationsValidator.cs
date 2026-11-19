using FluentValidation;
using Vibrent.Api.Common.Pagination;

namespace Vibrent.Api.Features.Applications.ListEventApplications;

internal sealed class ListEventApplicationsValidator : AbstractValidator<ListEventApplicationsQuery>
{
    public ListEventApplicationsValidator()
    {
        this.ValidatePaging();
        RuleFor(query => query.Status).IsInEnum();
    }
}
