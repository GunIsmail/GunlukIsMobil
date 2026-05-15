using FluentValidation;
using GunlukIs.Application.Features.Identity;
using GunlukIs.Application.Features.Identity.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GunlukIs.WebAPI.Controllers;

[Route("api/auth")]
public class AuthController : ApiControllerBase
{
    private readonly IIdentityService _identityService;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly IValidator<LoginRequest> _loginValidator;
    private readonly IValidator<RefreshRequest> _refreshValidator;
    private readonly IValidator<UpdateProfileRequest> _updateProfileValidator;

    public AuthController(
        IIdentityService identityService,
        IValidator<RegisterRequest> registerValidator,
        IValidator<LoginRequest> loginValidator,
        IValidator<RefreshRequest> refreshValidator,
        IValidator<UpdateProfileRequest> updateProfileValidator)
    {
        _identityService = identityService;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
        _refreshValidator = refreshValidator;
        _updateProfileValidator = updateProfileValidator;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        await _registerValidator.ValidateAndThrowAsync(request, cancellationToken);
        return ToActionResult(await _identityService.RegisterAsync(request, cancellationToken));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        await _loginValidator.ValidateAndThrowAsync(request, cancellationToken);
        return ToActionResult(await _identityService.LoginAsync(request, cancellationToken));
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request, CancellationToken cancellationToken)
    {
        await _refreshValidator.ValidateAndThrowAsync(request, cancellationToken);
        return ToActionResult(await _identityService.RefreshAsync(request, cancellationToken));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken) =>
        ToActionResult(await _identityService.GetProfileAsync(cancellationToken));

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        await _updateProfileValidator.ValidateAndThrowAsync(request, cancellationToken);
        return ToActionResult(await _identityService.UpdateProfileAsync(request, cancellationToken));
    }
}
