using GunlukIs.Domain.Common;

namespace GunlukIs.Domain.Entities;

public class WorkerRating : BaseEntity
{
    public Guid ApplicationId { get; private set; }
    public Application Application { get; private set; } = null!;

    public Guid WorkerId { get; private set; }
    public User Worker { get; private set; } = null!;

    public Guid RaterId { get; private set; }
    public User Rater { get; private set; } = null!;

    /// <summary>İletişim / Sosyal Beceriler (1-5)</summary>
    public int Communication { get; private set; }

    /// <summary>Servis Hızı ve Operasyonel Verimlilik (1-5)</summary>
    public int ServiceSpeed { get; private set; }

    /// <summary>Takım Çalışması (1-5)</summary>
    public int Teamwork { get; private set; }

    public string? Comment { get; private set; }

    public double Average => (Communication + ServiceSpeed + Teamwork) / 3.0;

    private WorkerRating() { }

    public WorkerRating(
        Guid applicationId,
        Guid workerId,
        Guid raterId,
        int communication,
        int serviceSpeed,
        int teamwork,
        string? comment)
    {
        ApplicationId = applicationId;
        WorkerId = workerId;
        RaterId = raterId;
        Communication = communication;
        ServiceSpeed = serviceSpeed;
        Teamwork = teamwork;
        Comment = comment;
    }
}
