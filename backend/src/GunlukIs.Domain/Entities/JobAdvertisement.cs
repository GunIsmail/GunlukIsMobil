using GunlukIs.Domain.Common;

namespace GunlukIs.Domain.Entities;

public class JobAdvertisement : BaseEntity
{
    public Guid EmployerId { get; private set; }
    public User Employer { get; private set; } = null!;

    public string Title { get; private set; } = null!;
    public string Description { get; private set; } = null!;
    public string District { get; private set; } = null!;
    public string Address { get; private set; } = null!;

    public DateTime JobDate { get; private set; }
    public TimeSpan StartTime { get; private set; }
    public TimeSpan EndTime { get; private set; }

    public decimal Price { get; private set; }
    public bool ProvidesFood { get; private set; }
    public bool ProvidesTransport { get; private set; }
    public bool IsActive { get; private set; } = true;

    public ICollection<Application> Applications { get; private set; } = new List<Application>();

    private JobAdvertisement() { }

    public JobAdvertisement(
        Guid employerId,
        string title,
        string description,
        string district,
        string address,
        DateTime jobDate,
        TimeSpan startTime,
        TimeSpan endTime,
        decimal price,
        bool providesFood,
        bool providesTransport)
    {
        EmployerId = employerId;
        Title = title;
        Description = description;
        District = district;
        Address = address;
        JobDate = DateTime.SpecifyKind(jobDate.Date, DateTimeKind.Utc);
        StartTime = startTime;
        EndTime = endTime;
        Price = price;
        ProvidesFood = providesFood;
        ProvidesTransport = providesTransport;
    }

    public void Deactivate()
    {
        IsActive = false;
        SetUpdated();
    }
}
