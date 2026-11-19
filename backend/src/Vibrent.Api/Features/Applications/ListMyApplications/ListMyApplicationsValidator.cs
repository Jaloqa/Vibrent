using FluentValidation;
using Vibrent.Api.Common.Pagination;

namespace Vibrent.Api.Features.Applications.ListMyApplications;

internal sealed class ListMyApplicationsValidator : AbstractValidator<ListMyApplicationsQuery>
{
    public ListMyApplicationsValidator()
    {
        this.ValidatePaging();
        RuleFor(query => query.Status).IsInEnum();
    }
}
