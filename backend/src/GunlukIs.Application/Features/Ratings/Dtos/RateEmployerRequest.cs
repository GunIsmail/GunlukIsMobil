namespace GunlukIs.Application.Features.Ratings.Dtos;

public record RateEmployerRequest(
    Guid ApplicationId,
    int WorkingConditions,
    int PaymentReliability,
    int ManagementStyle,
    string? Comment
);
