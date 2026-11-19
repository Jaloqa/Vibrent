namespace Vibrent.Api.Common.Pagination;

public interface IPagedQuery
{
    int Page { get; }

    int PageSize { get; }
}
