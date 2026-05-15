namespace GunlukIs.Application.Features.Identity.Dtos;

public record RefreshRequest(string AccessToken, string RefreshToken);
