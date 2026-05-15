using FluentValidation;
using GunlukIs.Application.Features.Ratings.Dtos;

namespace GunlukIs.Application.Features.Ratings.Validators;

public class RateWorkerRequestValidator : AbstractValidator<RateWorkerRequest>
{
    public RateWorkerRequestValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
        RuleFor(x => x.Communication).InclusiveBetween(1, 5);
        RuleFor(x => x.ServiceSpeed).InclusiveBetween(1, 5);
        RuleFor(x => x.Teamwork).InclusiveBetween(1, 5);
        RuleFor(x => x.Comment).MaximumLength(500).When(x => x.Comment is not null);
    }
}
