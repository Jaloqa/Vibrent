using MediatR;
using Vibrent.Api.Common.Pagination;

namespace Vibrent.Api.Features.Admin.ListUsers;

public sealed record ListUsersQuery(string? Search, int Page, int PageSize)
    : IRequest<PagedResponse<AdminUserResponse>>, IPagedQuery;
