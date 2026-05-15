namespace GunlukIs.Application.Features.Identity.Dtos;

public record UpdateProfileRequest(
    string FullName,
    string Email,
    string PhoneNumber
);
