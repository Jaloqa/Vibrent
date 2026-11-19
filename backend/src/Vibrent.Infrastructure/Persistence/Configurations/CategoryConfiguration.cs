using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vibrent.Domain.Categories;

namespace Vibrent.Infrastructure.Persistence.Configurations;

internal sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");
        builder.HasKey(category => category.Id);

        builder.Property(category => category.Name).HasMaxLength(50);
        builder.HasIndex(category => category.Name).IsUnique();

        builder.HasData(
            new { Id = Guid.Parse("019a9c40-0000-7000-8000-000000000001"), Name = "Imprezy" },
            new { Id = Guid.Parse("019a9c40-0000-7000-8000-000000000002"), Name = "Domówki" },
            new { Id = Guid.Parse("019a9c40-0000-7000-8000-000000000003"), Name = "Gry planszowe" },
            new { Id = Guid.Parse("019a9c40-0000-7000-8000-000000000004"), Name = "Wspólne wyjścia" },
            new { Id = Guid.Parse("019a9c40-0000-7000-8000-000000000005"), Name = "Sport" });
    }
}
