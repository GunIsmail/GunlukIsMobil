using GunlukIs.Domain.Common;
using GunlukIs.Domain.Enums;

namespace GunlukIs.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string PhoneNumber { get; private set; } = null!;
    public string PasswordHash { get; private set; } = null!;
    public UserRole Role { get; private set; }
    public bool IsEmailVerified { get; private set; }
    public bool IsPhoneVerified { get; private set; }
    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiry { get; private set; }

    public ICollection<JobAdvertisement> CreatedJobs { get; private set; } = new List<JobAdvertisement>();
    public ICollection<Application> Applications { get; private set; } = new List<Application>();

    private User() { }

    public User(string fullName, string email, string phoneNumber, string passwordHash, UserRole role)
    {
        FullName = fullName;
        Email = email;
        PhoneNumber = phoneNumber;
        PasswordHash = passwordHash;
        Role = role;
    }

    public void MarkEmailVerified()
    {
        IsEmailVerified = true;
        SetUpdated();
    }

    public void MarkPhoneVerified()
    {
        IsPhoneVerified = true;
        SetUpdated();
    }

    public void SetRefreshToken(string token, DateTime expiry)
    {
        RefreshToken = token;
        RefreshTokenExpiry = expiry;
        SetUpdated();
    }

    public void ClearRefreshToken()
    {
        RefreshToken = null;
        RefreshTokenExpiry = null;
        SetUpdated();
    }

    public bool HasValidRefreshToken(string token) =>
        RefreshToken == token && RefreshTokenExpiry.HasValue && RefreshTokenExpiry.Value > DateTime.UtcNow;
}
