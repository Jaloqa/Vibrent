using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vibrent.Domain.Events;
using Vibrent.Domain.Swipes;
using Vibrent.Domain.Users;

namespace Vibrent.Infrastructure.Persistence.Configurations;

internal sealed class SwipeConfiguration : IEntityTypeConfiguration<Swipe>
{
    public void Configure(EntityTypeBuilder<Swipe> builder)
    {
        builder.ToTable("Swipes");
        builder.HasKey(swipe => swipe.Id);

        builder.Property(swipe => swipe.Decision).HasConversion<string>().HasMaxLength(20);

        builder.HasOne<User>().WithMany().HasForeignKey(swipe => swipe.UserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Event>().WithMany().HasForeignKey(swipe => swipe.EventId).OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(swipe => new { swipe.UserId, swipe.EventId }).IsUnique();
    }
}
