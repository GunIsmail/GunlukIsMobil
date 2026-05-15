using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DomainApplication = GunlukIs.Domain.Entities.Application;

namespace GunlukIs.Infrastructure.Persistence.Configurations;

public class ApplicationConfiguration : IEntityTypeConfiguration<DomainApplication>
{
    public void Configure(EntityTypeBuilder<DomainApplication> builder)
    {
        builder.ToTable("applications");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status).HasConversion<int>().IsRequired();
        builder.Property(x => x.Message).HasMaxLength(1000);

        builder.HasIndex(x => new { x.JobAdvertisementId, x.WorkerId }).IsUnique();
        builder.HasIndex(x => x.Status);

        builder.HasMany(x => x.ChatMessages)
            .WithOne(m => m.Application)
            .HasForeignKey(m => m.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
