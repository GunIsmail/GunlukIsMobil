using GunlukIs.Application.Common.Persistence;
using GunlukIs.Domain.Entities;
using GunlukIs.Infrastructure.Persistence.Repositories;
using DomainApplication = GunlukIs.Domain.Entities.Application;

namespace GunlukIs.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public IGenericRepository<User> Users { get; }
    public IGenericRepository<JobAdvertisement> Jobs { get; }
    public IGenericRepository<DomainApplication> Applications { get; }
    public IGenericRepository<ChatMessage> ChatMessages { get; }
    public IGenericRepository<WorkerRating> WorkerRatings { get; }
    public IGenericRepository<EmployerRating> EmployerRatings { get; }

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        Users = new GenericRepository<User>(context);
        Jobs = new GenericRepository<JobAdvertisement>(context);
        Applications = new GenericRepository<DomainApplication>(context);
        ChatMessages = new GenericRepository<ChatMessage>(context);
        WorkerRatings = new GenericRepository<WorkerRating>(context);
        EmployerRatings = new GenericRepository<EmployerRating>(context);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _context.SaveChangesAsync(cancellationToken);
}
