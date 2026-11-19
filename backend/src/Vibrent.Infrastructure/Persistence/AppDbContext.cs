using Microsoft.EntityFrameworkCore;
using Vibrent.Domain.Applications;
using Vibrent.Domain.Categories;
using Vibrent.Domain.Events;
using Vibrent.Domain.Swipes;
using Vibrent.Domain.Users;

namespace Vibrent.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Event> Events => Set<Event>();

    public DbSet<Swipe> Swipes => Set<Swipe>();

    public DbSet<EventApplication> Applications => Set<EventApplication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
}
