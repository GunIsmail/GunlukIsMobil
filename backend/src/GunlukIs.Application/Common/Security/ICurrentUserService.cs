using GunlukIs.Domain.Enums;

namespace GunlukIs.Application.Common.Security;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    UserRole? Role { get; }
    bool IsAuthenticated { get; }
}
