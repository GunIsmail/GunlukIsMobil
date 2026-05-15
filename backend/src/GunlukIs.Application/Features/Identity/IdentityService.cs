using System.IdentityModel.Tokens.Jwt;
using GunlukIs.Application.Common.Persistence;
using GunlukIs.Application.Common.Results;
using GunlukIs.Application.Common.Security;
using GunlukIs.Application.Common.Verification;
using GunlukIs.Application.Features.Identity.Dtos;
using GunlukIs.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GunlukIs.Application.Features.Identity;

public class IdentityService : IIdentityService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly ICurrentUserService _currentUser;

    public IdentityService(
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        IEmailService emailService,
        ISmsService smsService,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _emailService = emailService;
        _smsService = smsService;
        _currentUser = currentUser;
    }

    public async Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var emailLower = request.Email.Trim().ToLowerInvariant();
        var existing = await _unitOfWork.Users.SingleOrDefaultAsync(
            u => u.Email == emailLower || u.PhoneNumber == request.PhoneNumber, cancellationToken);

        if (existing is not null)
            return Result.Failure<AuthResponse>("Bu e-posta veya telefon numarası ile kayıtlı bir kullanıcı zaten var.", 409);

        var passwordHash = _passwordHasher.Hash(request.Password);
        var user = new User(request.FullName.Trim(), emailLower, request.PhoneNumber, passwordHash, request.Role);

        await _unitOfWork.Users.AddAsync(user, cancellationToken);

        var tokens = _jwtTokenService.GenerateTokens(user);
        user.SetRefreshToken(tokens.RefreshToken, tokens.RefreshTokenExpiresAt);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var verificationCode = Random.Shared.Next(100000, 999999).ToString();
        await _emailService.SendVerificationCodeAsync(user.Email, verificationCode, cancellationToken);
        await _smsService.SendVerificationCodeAsync(user.PhoneNumber, verificationCode, cancellationToken);

        return Result.Success(BuildResponse(user, tokens), 201);
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var emailLower = request.Email.Trim().ToLowerInvariant();
        var user = await _unitOfWork.Users.SingleOrDefaultAsync(u => u.Email == emailLower, cancellationToken);
        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            return Result.Failure<AuthResponse>("E-posta veya şifre hatalı.", 401);

        var tokens = _jwtTokenService.GenerateTokens(user);
        user.SetRefreshToken(tokens.RefreshToken, tokens.RefreshTokenExpiresAt);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(BuildResponse(user, tokens));
    }

    public async Task<Result<AuthResponse>> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default)
    {
        var userId = ExtractUserIdFromExpiredToken(request.AccessToken);
        if (userId is null)
            return Result.Failure<AuthResponse>("Geçersiz erişim anahtarı.", 401);

        var user = await _unitOfWork.Users.GetByIdAsync(userId.Value, cancellationToken);
        if (user is null || !user.HasValidRefreshToken(request.RefreshToken))
            return Result.Failure<AuthResponse>("Yenileme anahtarı geçersiz veya süresi dolmuş.", 401);

        var tokens = _jwtTokenService.GenerateTokens(user);
        user.SetRefreshToken(tokens.RefreshToken, tokens.RefreshTokenExpiresAt);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(BuildResponse(user, tokens));
    }

    public async Task<Result<ProfileResponse>> GetProfileAsync(CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            return Result.Failure<ProfileResponse>("Yetkisiz işlem.", 401);

        var user = await _unitOfWork.Users.GetByIdAsync(_currentUser.UserId.Value, cancellationToken);
        if (user is null)
            return Result.Failure<ProfileResponse>("Kullanıcı bulunamadı.", 404);

        return Result.Success(new ProfileResponse(user.Id, user.FullName, user.Email, user.PhoneNumber));
    }

    public async Task<Result<ProfileResponse>> UpdateProfileAsync(UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            return Result.Failure<ProfileResponse>("Yetkisiz işlem.", 401);

        var user = await _unitOfWork.Users.GetByIdAsync(_currentUser.UserId.Value, cancellationToken);
        if (user is null)
            return Result.Failure<ProfileResponse>("Kullanıcı bulunamadı.", 404);

        var emailLower = request.Email.Trim().ToLowerInvariant();

        var conflict = await _unitOfWork.Users.Query()
            .Where(u => u.Id != user.Id && (u.Email == emailLower || u.PhoneNumber == request.PhoneNumber))
            .AnyAsync(cancellationToken);

        if (conflict)
            return Result.Failure<ProfileResponse>("Bu e-posta veya telefon başka bir hesaba ait.", 409);

        user.UpdateProfile(request.FullName.Trim(), emailLower, request.PhoneNumber);
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(new ProfileResponse(user.Id, user.FullName, user.Email, user.PhoneNumber));
    }

    private static Guid? ExtractUserIdFromExpiredToken(string accessToken)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            if (!handler.CanReadToken(accessToken)) return null;
            var jwt = handler.ReadJwtToken(accessToken);
            var sub = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
            return Guid.TryParse(sub, out var id) ? id : null;
        }
        catch
        {
            return null;
        }
    }

    private static AuthResponse BuildResponse(User user, AuthTokens tokens) => new(
        user.Id,
        user.FullName,
        user.Email,
        user.Role,
        tokens.AccessToken,
        tokens.AccessTokenExpiresAt,
        tokens.RefreshToken,
        tokens.RefreshTokenExpiresAt);
}
