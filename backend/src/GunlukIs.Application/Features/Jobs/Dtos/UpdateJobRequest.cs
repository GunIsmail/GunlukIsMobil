namespace GunlukIs.Application.Features.Jobs.Dtos;

public record UpdateJobRequest(
    string Title,
    string Description,
    string District,
    string Address,
    DateTime JobDate,
    TimeSpan StartTime,
    TimeSpan EndTime,
    decimal Price,
    bool ProvidesFood,
    bool ProvidesTransport,
    int Quota);
