namespace GunlukIs.Infrastructure.Security;

public class JwtOptions
{
    public const string SectionName = "Jwt";
    public string Issuer { get; set; } = null!;
    public string Audience { get; set; } = null!;
    public string SecretKey { get; set; } = null!;
    public int AccessTokenDays { get; set; } = 7;
    public int RefreshTokenDays { get; set; } = 30;
}
