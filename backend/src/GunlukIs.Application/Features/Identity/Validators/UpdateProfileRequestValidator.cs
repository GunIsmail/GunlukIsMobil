using FluentValidation;
using GunlukIs.Application.Features.Identity.Dtos;

namespace GunlukIs.Application.Features.Identity.Validators;

public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Ad Soyad boş olamaz.")
            .MinimumLength(3).WithMessage("Ad Soyad en az 3 karakter olmalıdır.")
            .MaximumLength(100);

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-posta boş olamaz.")
            .EmailAddress().WithMessage("Geçerli bir e-posta giriniz.")
            .MaximumLength(200);

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Telefon numarası boş olamaz.")
            .Matches(@"^\+90[0-9]{10}$").WithMessage("Geçerli bir TR telefon numarası giriniz.");
    }
}
