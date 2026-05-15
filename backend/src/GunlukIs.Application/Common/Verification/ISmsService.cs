namespace GunlukIs.Application.Common.Verification;

public interface ISmsService
{
    Task SendVerificationCodeAsync(string toPhone, string code, CancellationToken cancellationToken = default);
}
