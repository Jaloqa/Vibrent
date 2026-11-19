using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vibrent.Domain.Users;

namespace Vibrent.Infrastructure.Persistence.Configurations;

internal sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(user => user.Id);

        builder.Property(user => user.Email).HasMaxLength(256);
        builder.Property(user => user.PasswordHash).HasMaxLength(256);
        builder.Property(user => user.DisplayName).HasMaxLength(50);
        builder.Property(user => user.Bio).HasMaxLength(500);
        builder.Property(user => user.AvatarUrl).HasMaxLength(2048);
        builder.Property(user => user.City).HasMaxLength(100);
        builder.Property(user => user.Role).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(user => user.Email).IsUnique();
    }
}
