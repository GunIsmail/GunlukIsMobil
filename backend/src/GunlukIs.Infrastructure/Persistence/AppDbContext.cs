using GunlukIs.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using DomainApplication = GunlukIs.Domain.Entities.Application;

namespace GunlukIs.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<JobAdvertisement> JobAdvertisements => Set<JobAdvertisement>();
    public DbSet<DomainApplication> Applications => Set<DomainApplication>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<WorkerRating> WorkerRatings => Set<WorkerRating>();
    public DbSet<EmployerRating> EmployerRatings => Set<EmployerRating>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
