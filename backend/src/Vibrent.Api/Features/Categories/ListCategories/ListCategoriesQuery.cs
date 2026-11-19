using MediatR;

namespace Vibrent.Api.Features.Categories.ListCategories;

public sealed record ListCategoriesQuery : IRequest<IReadOnlyList<CategoryResponse>>;
