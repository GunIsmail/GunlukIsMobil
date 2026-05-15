namespace GunlukIs.Application.Common.Persistence;

public interface IUnitOfWork
{
    IGenericRepository<Domain.Entities.User> Users { get; }
    IGenericRepository<Domain.Entities.JobAdvertisement> Jobs { get; }
    IGenericRepository<Domain.Entities.Application> Applications { get; }
    IGenericRepository<Domain.Entities.ChatMessage> ChatMessages { get; }
    IGenericRepository<Domain.Entities.WorkerRating> WorkerRatings { get; }
    IGenericRepository<Domain.Entities.EmployerRating> EmployerRatings { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
