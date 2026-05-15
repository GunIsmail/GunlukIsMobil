namespace GunlukIs.Application.Features.Jobs.Dtos;

public record JobFilterRequest(
    string? District,
    DateTime? DateFrom,
    DateTime? DateTo,
    decimal? PriceMin,
    decimal? PriceMax,
    bool? ProvidesFood,
    bool? ProvidesTransport);
