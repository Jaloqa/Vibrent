namespace Vibrent.Api.Common.Pagination;

public sealed record PagedResponse<TItem>(IReadOnlyList<TItem> Items, int Page, int PageSize, int TotalCount);
