using Vibrent.Domain.Common;

namespace Vibrent.Domain.Categories;

public static class CategoryErrors
{
    public static readonly Error NotFound =
        Error.Validation("Category.NotFound", "The selected category does not exist.");
}
