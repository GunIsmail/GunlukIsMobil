namespace GunlukIs.Application.Features.Ratings.Dtos;

public record WorkerRatingSummaryResponse(
    Guid WorkerId,
    string WorkerName,
    int TotalRatings,
    double OverallAverage,
    double CommunicationAvg,
    double ServiceSpeedAvg,
    double TeamworkAvg
);
