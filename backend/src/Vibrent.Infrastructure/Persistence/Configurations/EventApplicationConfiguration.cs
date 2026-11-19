using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vibrent.Domain.Applications;
using Vibrent.Domain.Events;
using Vibrent.Domain.Users;

namespace Vibrent.Infrastructure.Persistence.Configurations;

internal sealed class EventApplicationConfiguration : IEntityTypeConfiguration<EventApplication>
{
    public void Configure(EntityTypeBuilder<EventApplication> builder)
    {
        builder.ToTable("Applications");
        builder.HasKey(application => application.Id);

        builder.Property(application => application.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property<uint>(PersistenceConstants.RowVersion).IsRowVersion();

        builder.HasOne<User>().WithMany().HasForeignKey(application => application.UserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Event>().WithMany().HasForeignKey(application => application.EventId).OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(application => new { application.UserId, application.EventId }).IsUnique();
        builder.HasIndex(application => new { application.EventId, application.Status });
    }
}
