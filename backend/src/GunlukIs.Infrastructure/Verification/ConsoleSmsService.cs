using GunlukIs.Application.Common.Verification;
using Microsoft.Extensions.Logging;

namespace GunlukIs.Infrastructure.Verification;

public class ConsoleSmsService : ISmsService
{
    private readonly ILogger<ConsoleSmsService> _logger;

    public ConsoleSmsService(ILogger<ConsoleSmsService> logger)
    {
        _logger = logger;
    }

    public Task SendVerificationCodeAsync(string toPhone, string code, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[SMS SIMULATION] To: {Phone} | Code: {Code}", toPhone, code);
        Console.WriteLine($"[SMS SIMULATION] To: {toPhone} | Code: {code}");
        return Task.CompletedTask;
    }
}
