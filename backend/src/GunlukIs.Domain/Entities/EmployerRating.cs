using GunlukIs.Domain.Common;

namespace GunlukIs.Domain.Entities;

public class EmployerRating : BaseEntity
{
    public Guid ApplicationId { get; private set; }
    public Application Application { get; private set; } = null!;

    public Guid EmployerId { get; private set; }
    public User Employer { get; private set; } = null!;

    public Guid RaterId { get; private set; }
    public User Rater { get; private set; } = null!;

    /// <summary>Çalışma Şartları ve Fiziksel Koşullar (1-5)</summary>
    public int WorkingConditions { get; private set; }

    /// <summary>Ödeme Güvenilirliği (1-5)</summary>
    public int PaymentReliability { get; private set; }

    /// <summary>Yönetim Tarzı ve Saygı (1-5)</summary>
    public int ManagementStyle { get; private set; }

    public string? Comment { get; private set; }

    public double Average => (WorkingConditions + PaymentReliability + ManagementStyle) / 3.0;

    private EmployerRating() { }

    public EmployerRating(
        Guid applicationId,
        Guid employerId,
        Guid raterId,
        int workingConditions,
        int paymentReliability,
        int managementStyle,
        string? comment)
    {
        ApplicationId = applicationId;
        EmployerId = employerId;
        RaterId = raterId;
        WorkingConditions = workingConditions;
        PaymentReliability = paymentReliability;
        ManagementStyle = managementStyle;
        Comment = comment;
    }
}
