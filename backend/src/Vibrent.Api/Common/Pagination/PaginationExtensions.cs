using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Vibrent.Api.Common.Pagination;

internal static class PaginationExtensions
{
    public const int DefaultPage = 1;

    public const int DefaultPageSize = 20;

    public const int MaxPageSize = 100;

    public static async Task<PagedResponse<TItem>> ToPagedResponseAsync<TItem>(
        this IQueryable<TItem> query,
        IPagedQuery paging,
        CancellationToken cancellationToken)
    {
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((paging.Page - 1) * paging.PageSize)
            .Take(paging.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResponse<TItem>(items, paging.Page, paging.PageSize, totalCount);
    }

    public static void ValidatePaging<TQuery>(this AbstractValidator<TQuery> validator)
        where TQuery : IPagedQuery
    {
        validator.RuleFor(query => query.Page).GreaterThanOrEqualTo(1);
        validator.RuleFor(query => query.PageSize).InclusiveBetween(1, MaxPageSize);
    }
}
