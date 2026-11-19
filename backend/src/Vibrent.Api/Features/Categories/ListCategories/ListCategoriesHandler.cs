using MediatR;
using Microsoft.EntityFrameworkCore;
using Vibrent.Infrastructure.Persistence;

namespace Vibrent.Api.Features.Categories.ListCategories;

internal sealed class ListCategoriesHandler(AppDbContext dbContext)
    : IRequestHandler<ListCategoriesQuery, IReadOnlyList<CategoryResponse>>
{
    public async Task<IReadOnlyList<CategoryResponse>> Handle(ListCategoriesQuery query, CancellationToken cancellationToken) =>
        await dbContext.Categories
            .AsNoTracking()
            .OrderBy(category => category.Name)
            .Select(category => new CategoryResponse(category.Id, category.Name))
            .ToListAsync(cancellationToken);
}
