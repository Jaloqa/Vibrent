using MediatR;
using Microsoft.EntityFrameworkCore;
using Vibrent.Api.Common.Pagination;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Admin.ListUsers;

internal sealed class ListUsersHandler(AppDbContext dbContext) : IRequestHandler<ListUsersQuery, PagedResponse<AdminUserResponse>>
{
    private const string LikeEscape = "\\";

    public Task<PagedResponse<AdminUserResponse>> Handle(ListUsersQuery query, CancellationToken cancellationToken)
    {
        var users = dbContext.Users.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var pattern = $"%{EscapeLikePattern(query.Search.Trim())}%";
            users = users.Where(user =>
                EF.Functions.ILike(user.Email, pattern, LikeEscape)
                || EF.Functions.ILike(user.DisplayName, pattern, LikeEscape));
        }

        return users
            .OrderByDescending(user => user.CreatedAt)
            .ThenByDescending(user => user.Id)
            .Select(user => new AdminUserResponse(
                user.Id,
                user.Email,
                user.DisplayName,
                user.Role,
                user.IsBlocked,
                user.CreatedAt))
            .ToPagedResponseAsync(query, cancellationToken);
    }

    private static string EscapeLikePattern(string value) => value
        .Replace(LikeEscape, LikeEscape + LikeEscape, StringComparison.Ordinal)
        .Replace("%", LikeEscape + "%", StringComparison.Ordinal)
        .Replace("_", LikeEscape + "_", StringComparison.Ordinal);
}
