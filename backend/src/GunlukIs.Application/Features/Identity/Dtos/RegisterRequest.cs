using GunlukIs.Domain.Enums;

namespace GunlukIs.Application.Features.Identity.Dtos;

public record RegisterRequest(
    string FullName,
    string Email,
    string PhoneNumber,
    string Password,
    UserRole Role);
