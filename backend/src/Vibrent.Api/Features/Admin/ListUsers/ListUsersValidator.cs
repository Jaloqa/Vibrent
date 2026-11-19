using FluentValidation;
using Vibrent.Api.Common.Pagination;

namespace Vibrent.Api.Features.Admin.ListUsers;

internal sealed class ListUsersValidator : AbstractValidator<ListUsersQuery>
{
    public ListUsersValidator()
    {
        this.ValidatePaging();
        RuleFor(query => query.Search).MaximumLength(100);
    }
}
