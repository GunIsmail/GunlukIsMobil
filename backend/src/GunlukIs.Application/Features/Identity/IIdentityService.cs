using GunlukIs.Application.Common.Results;
using GunlukIs.Application.Features.Identity.Dtos;

namespace GunlukIs.Application.Features.Identity;

public interface IIdentityService
{
    Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<Result<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<Result<AuthResponse>> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default);
    Task<Result<ProfileResponse>> GetProfileAsync(CancellationToken cancellationToken = default);
    Task<Result<ProfileResponse>> UpdateProfileAsync(UpdateProfileRequest request, CancellationToken cancellationToken = default);
}
