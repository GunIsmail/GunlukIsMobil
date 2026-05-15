using FluentValidation;
using GunlukIs.Application.Features.Ratings.Dtos;

namespace GunlukIs.Application.Features.Ratings.Validators;

public class RateEmployerRequestValidator : AbstractValidator<RateEmployerRequest>
{
    public RateEmployerRequestValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
        RuleFor(x => x.WorkingConditions).InclusiveBetween(1, 5);
        RuleFor(x => x.PaymentReliability).InclusiveBetween(1, 5);
        RuleFor(x => x.ManagementStyle).InclusiveBetween(1, 5);
        RuleFor(x => x.Comment).MaximumLength(500).When(x => x.Comment is not null);
    }
}
