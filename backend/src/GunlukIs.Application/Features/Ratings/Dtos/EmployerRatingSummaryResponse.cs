namespace GunlukIs.Application.Features.Ratings.Dtos;

public record EmployerRatingSummaryResponse(
    Guid EmployerId,
    string EmployerName,
    int TotalRatings,
    double OverallAverage,
    double WorkingConditionsAvg,
    double PaymentReliabilityAvg,
    double ManagementStyleAvg
);
