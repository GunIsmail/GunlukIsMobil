using GunlukIs.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GunlukIs.Infrastructure.Persistence.Configurations;

public class EmployerRatingConfiguration : IEntityTypeConfiguration<EmployerRating>
{
    public void Configure(EntityTypeBuilder<EmployerRating> builder)
    {
        builder.ToTable("employer_ratings");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.WorkingConditions).IsRequired();
        builder.Property(x => x.PaymentReliability).IsRequired();
        builder.Property(x => x.ManagementStyle).IsRequired();
        builder.Property(x => x.Comment).HasMaxLength(500);

        // One rating per application (worker can rate an employer only once per application)
        builder.HasIndex(x => x.ApplicationId).IsUnique();

        builder.HasOne(x => x.Application)
            .WithOne(a => a.EmployerRating)
            .HasForeignKey<EmployerRating>(x => x.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Employer)
            .WithMany(u => u.EmployerRatingsReceived)
            .HasForeignKey(x => x.EmployerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Rater)
            .WithMany()
            .HasForeignKey(x => x.RaterId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
