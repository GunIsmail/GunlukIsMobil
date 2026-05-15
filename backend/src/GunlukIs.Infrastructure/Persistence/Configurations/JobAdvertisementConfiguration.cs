using GunlukIs.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GunlukIs.Infrastructure.Persistence.Configurations;

public class JobAdvertisementConfiguration : IEntityTypeConfiguration<JobAdvertisement>
{
    public void Configure(EntityTypeBuilder<JobAdvertisement> builder)
    {
        builder.ToTable("job_advertisements");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.District).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Address).HasMaxLength(500).IsRequired();
        builder.Property(x => x.Price).HasColumnType("numeric(10,2)").IsRequired();
        builder.Property(x => x.JobDate).IsRequired();
        builder.Property(x => x.StartTime).IsRequired();
        builder.Property(x => x.EndTime).IsRequired();

        builder.HasIndex(x => x.District);
        builder.HasIndex(x => x.JobDate);
        builder.HasIndex(x => x.IsActive);

        builder.HasMany(x => x.Applications)
            .WithOne(a => a.JobAdvertisement)
            .HasForeignKey(a => a.JobAdvertisementId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
