namespace Vibrent.Domain.Categories;

public sealed class Category
{
    private Category()
    {
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;
}
