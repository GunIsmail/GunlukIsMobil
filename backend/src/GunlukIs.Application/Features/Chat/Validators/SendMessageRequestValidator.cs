using FluentValidation;
using GunlukIs.Application.Features.Chat.Dtos;

namespace GunlukIs.Application.Features.Chat.Validators;

public class SendMessageRequestValidator : AbstractValidator<SendMessageRequest>
{
    public SendMessageRequestValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
        RuleFor(x => x.Content).NotEmpty().MaximumLength(2000);
    }
}
