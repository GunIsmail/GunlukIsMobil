using GunlukIs.Domain.Entities;

namespace GunlukIs.Application.Common.Security;

public interface IJwtTokenService
{
    AuthTokens GenerateTokens(User user);
    string GenerateRefreshToken();
}

public record AuthTokens(string AccessToken, DateTime AccessTokenExpiresAt, string RefreshToken, DateTime RefreshTokenExpiresAt);
