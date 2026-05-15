using GunlukIs.Domain.Common;
using GunlukIs.Domain.Enums;

namespace GunlukIs.Domain.Entities;

public class Application : BaseEntity
{
    public Guid JobAdvertisementId { get; private set; }
    public JobAdvertisement JobAdvertisement { get; private set; } = null!;

    public Guid WorkerId { get; private set; }
    public User Worker { get; private set; } = null!;

    public string? Message { get; private set; }
    public ApplicationStatus Status { get; private set; } = ApplicationStatus.Pending;

    public ICollection<ChatMessage> ChatMessages { get; private set; } = new List<ChatMessage>();

    public WorkerRating? WorkerRating { get; private set; }
    public EmployerRating? EmployerRating { get; private set; }

    private Application() { }

    public Application(Guid jobAdvertisementId, Guid workerId, string? message)
    {
        JobAdvertisementId = jobAdvertisementId;
        WorkerId = workerId;
        Message = message;
    }

    public void Accept()
    {
        Status = ApplicationStatus.Accepted;
        SetUpdated();
    }

    public void Reject()
    {
        Status = ApplicationStatus.Rejected;
        SetUpdated();
    }

    public void Cancel()
    {
        Status = ApplicationStatus.Cancelled;
        SetUpdated();
    }

    public bool ChatAllowed => Status == ApplicationStatus.Accepted;
}
