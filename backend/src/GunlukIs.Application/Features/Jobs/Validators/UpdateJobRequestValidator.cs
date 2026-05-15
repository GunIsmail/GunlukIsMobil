using FluentValidation;
using GunlukIs.Application.Features.Jobs.Dtos;
using GunlukIs.Domain.Enums;

namespace GunlukIs.Application.Features.Jobs.Validators;

public class UpdateJobRequestValidator : AbstractValidator<UpdateJobRequest>
{
    public UpdateJobRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Başlık zorunludur.")
            .MinimumLength(3).WithMessage("Başlık en az 3 karakter olmalıdır.")
            .MaximumLength(200);

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Açıklama zorunludur.")
            .MinimumLength(10).WithMessage("Açıklama en az 10 karakter olmalıdır.")
            .MaximumLength(2000);

        RuleFor(x => x.District)
            .NotEmpty().WithMessage("İlçe seçimi zorunludur.")
            .Must(IstanbulDistricts.IsValid)
            .WithMessage("Geçerli bir İstanbul ilçesi seçiniz.");

        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("Adres zorunludur.")
            .MaximumLength(500);

        RuleFor(x => x.JobDate)
            .Must(d => d.Date >= DateTime.UtcNow.Date)
            .WithMessage("İş tarihi geçmiş olamaz.");

        RuleFor(x => x.StartTime)
            .LessThan(x => x.EndTime)
            .WithMessage("Başlangıç saati bitiş saatinden önce olmalıdır.");

        RuleFor(x => x)
            .Must(BeFutureDateTime)
            .WithMessage("İş başlangıç saati geçmişte olamaz.")
            .OverridePropertyName(nameof(UpdateJobRequest.StartTime));

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Ücret sıfırdan büyük olmalıdır.")
            .LessThanOrEqualTo(1_000_000m).WithMessage("Ücret çok yüksek.");
    }

    private static bool BeFutureDateTime(UpdateJobRequest request)
    {
        var start = request.JobDate.Date.Add(request.StartTime);
        return start > DateTime.UtcNow;
    }
}
