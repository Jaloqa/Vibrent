using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vibrent.Domain.Categories;
using Vibrent.Domain.Events;
using Vibrent.Domain.Users;

namespace Vibrent.Infrastructure.Persistence.Configurations;

internal sealed class EventConfiguration : IEntityTypeConfiguration<Event>
{
    public void Configure(EntityTypeBuilder<Event> builder)
    {
        builder.ToTable("Events", table =>
        {
            table.HasCheckConstraint("CK_Events_Capacity_Positive", "\"Capacity\" > 0");
            table.HasCheckConstraint("CK_Events_AcceptedCount_WithinCapacity", "\"AcceptedCount\" >= 0 AND \"AcceptedCount\" <= \"Capacity\"");
            table.HasCheckConstraint("CK_Events_Latitude_Range", "\"Latitude\" BETWEEN -90 AND 90");
            table.HasCheckConstraint("CK_Events_Longitude_Range", "\"Longitude\" BETWEEN -180 AND 180");
        });
        builder.HasKey(@event => @event.Id);

        builder.Property(@event => @event.Title).HasMaxLength(100);
        builder.Property(@event => @event.Description).HasMaxLength(2000);
        builder.Property(@event => @event.Address).HasMaxLength(200);
        builder.Property(@event => @event.ImageUrl).HasMaxLength(2048);
        builder.Property(@event => @event.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property<uint>(PersistenceConstants.RowVersion).IsRowVersion();

        builder.HasOne<User>().WithMany().HasForeignKey(@event => @event.OrganizerId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Category>().WithMany().HasForeignKey(@event => @event.CategoryId).OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(@event => new { @event.Status, @event.StartsAt });
        builder.HasIndex(@event => new { @event.Latitude, @event.Longitude });
    }
}
