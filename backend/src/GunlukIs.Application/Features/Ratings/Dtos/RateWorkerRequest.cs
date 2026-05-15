namespace GunlukIs.Application.Features.Ratings.Dtos;

public record RateWorkerRequest(
    Guid ApplicationId,
    int Communication,
    int ServiceSpeed,
    int Teamwork,
    string? Comment
);
