using GunlukIs.Domain.Enums;

namespace GunlukIs.Application.Features.Applications.Dtos;

public record ApplicationResponse(
    Guid Id,
    Guid JobAdvertisementId,
    string JobTitle,
    Guid WorkerId,
    string WorkerName,
    string WorkerPhone,
    string? Message,
    ApplicationStatus Status,
    DateTime CreatedAt);
