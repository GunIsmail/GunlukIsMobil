using GunlukIs.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GunlukIs.Infrastructure.Persistence.Configurations;

public class WorkerRatingConfiguration : IEntityTypeConfiguration<WorkerRating>
{
    public void Configure(EntityTypeBuilder<WorkerRating> builder)
    {
        builder.ToTable("worker_ratings");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Communication).IsRequired();
        builder.Property(x => x.ServiceSpeed).IsRequired();
        builder.Property(x => x.Teamwork).IsRequired();
        builder.Property(x => x.Comment).HasMaxLength(500);

        // One rating per application (employer can rate a worker only once per application)
        builder.HasIndex(x => x.ApplicationId).IsUnique();

        builder.HasOne(x => x.Application)
            .WithOne(a => a.WorkerRating)
            .HasForeignKey<WorkerRating>(x => x.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Worker)
            .WithMany(u => u.WorkerRatingsReceived)
            .HasForeignKey(x => x.WorkerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Rater)
            .WithMany()
            .HasForeignKey(x => x.RaterId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
