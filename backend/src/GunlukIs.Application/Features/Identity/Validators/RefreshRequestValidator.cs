using FluentValidation;
using GunlukIs.Application.Features.Identity.Dtos;

namespace GunlukIs.Application.Features.Identity.Validators;

public class RefreshRequestValidator : AbstractValidator<RefreshRequest>
{
    public RefreshRequestValidator()
    {
        RuleFor(x => x.AccessToken).NotEmpty();
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}
