using GunlukIs.Domain.Enums;

namespace GunlukIs.Application.Features.Identity.Dtos;

public record AuthResponse(
    Guid UserId,
    string FullName,
    string Email,
    UserRole Role,
    string AccessToken,
    DateTime AccessTokenExpiresAt,
    string RefreshToken,
    DateTime RefreshTokenExpiresAt);
