using GunlukIs.Application.Common.Verification;
using Microsoft.Extensions.Logging;

namespace GunlukIs.Infrastructure.Verification;

public class ConsoleEmailService : IEmailService
{
    private readonly ILogger<ConsoleEmailService> _logger;

    public ConsoleEmailService(ILogger<ConsoleEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendVerificationCodeAsync(string toEmail, string code, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[EMAIL SIMULATION] To: {Email} | Code: {Code}", toEmail, code);
        Console.WriteLine($"[EMAIL SIMULATION] To: {toEmail} | Code: {code}");
        return Task.CompletedTask;
    }
}
