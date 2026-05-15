namespace GunlukIs.Application.Common.Verification;

public interface IEmailService
{
    Task SendVerificationCodeAsync(string toEmail, string code, CancellationToken cancellationToken = default);
}
