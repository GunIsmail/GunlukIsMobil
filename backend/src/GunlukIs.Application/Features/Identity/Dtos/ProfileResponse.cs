namespace GunlukIs.Application.Features.Identity.Dtos;

public record ProfileResponse(
    Guid UserId,
    string FullName,
    string Email,
    string PhoneNumber
);
