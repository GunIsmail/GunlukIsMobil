namespace GunlukIs.Application.Features.Applications.Dtos;

public record ApplyToJobRequest(Guid JobAdvertisementId, string? Message);
