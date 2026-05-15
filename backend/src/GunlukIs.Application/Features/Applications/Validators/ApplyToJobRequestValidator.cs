using FluentValidation;
using GunlukIs.Application.Features.Applications.Dtos;

namespace GunlukIs.Application.Features.Applications.Validators;

public class ApplyToJobRequestValidator : AbstractValidator<ApplyToJobRequest>
{
    public ApplyToJobRequestValidator()
    {
        RuleFor(x => x.JobAdvertisementId).NotEmpty().WithMessage("İlan kimliği gereklidir.");
        RuleFor(x => x.Message).MaximumLength(1000).WithMessage("Mesaj en fazla 1000 karakter olabilir.");
    }
}
