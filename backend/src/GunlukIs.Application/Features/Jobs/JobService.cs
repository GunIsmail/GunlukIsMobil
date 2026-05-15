using GunlukIs.Application.Common.Persistence;
using GunlukIs.Application.Common.Results;
using GunlukIs.Application.Common.Security;
using GunlukIs.Application.Features.Jobs.Dtos;
using GunlukIs.Domain.Entities;
using GunlukIs.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace GunlukIs.Application.Features.Jobs;

public class JobService : IJobService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public JobService(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<Result<JobResponse>> CreateAsync(CreateJobRequest request, CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            return Result.Failure<JobResponse>("Yetkisiz işlem.", 401);
        if (_currentUser.Role != UserRole.Employer)
            return Result.Failure<JobResponse>("Yalnızca işverenler ilan oluşturabilir.", 403);

        var job = new JobAdvertisement(
            _currentUser.UserId.Value,
            request.Title.Trim(),
            request.Description.Trim(),
            request.District,
            request.Address.Trim(),
            request.JobDate,
            request.StartTime,
            request.EndTime,
            request.Price,
            request.ProvidesFood,
            request.ProvidesTransport);

        await _unitOfWork.Jobs.AddAsync(job, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var employer = await _unitOfWork.Users.GetByIdAsync(_currentUser.UserId.Value, cancellationToken);
        return Result.Success(ToResponse(job, employer?.FullName ?? string.Empty), 201);
    }

    public async Task<Result<IReadOnlyList<JobResponse>>> ListAsync(JobFilterRequest filter, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Jobs.Query()
            .Include(j => j.Employer)
            .Where(j => j.IsActive);

        if (!string.IsNullOrWhiteSpace(filter.District))
            query = query.Where(j => j.District == filter.District);

        if (filter.DateFrom.HasValue)
        {
            var from = DateTime.SpecifyKind(filter.DateFrom.Value.Date, DateTimeKind.Utc);
            query = query.Where(j => j.JobDate >= from);
        }

        if (filter.DateTo.HasValue)
        {
            var to = DateTime.SpecifyKind(filter.DateTo.Value.Date, DateTimeKind.Utc);
            query = query.Where(j => j.JobDate <= to);
        }

        if (filter.PriceMin.HasValue)
            query = query.Where(j => j.Price >= filter.PriceMin.Value);

        if (filter.PriceMax.HasValue)
            query = query.Where(j => j.Price <= filter.PriceMax.Value);

        if (filter.ProvidesFood.HasValue)
            query = query.Where(j => j.ProvidesFood == filter.ProvidesFood.Value);

        if (filter.ProvidesTransport.HasValue)
            query = query.Where(j => j.ProvidesTransport == filter.ProvidesTransport.Value);

        var items = await query
            .OrderBy(j => j.JobDate)
            .ThenBy(j => j.StartTime)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        IReadOnlyList<JobResponse> mapped = items
            .Select(j => ToResponse(j, j.Employer.FullName))
            .ToList();

        return Result.Success(mapped);
    }

    public async Task<Result<JobResponse>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var job = await _unitOfWork.Jobs.Query()
            .Include(j => j.Employer)
            .AsNoTracking()
            .FirstOrDefaultAsync(j => j.Id == id, cancellationToken);

        return job is null
            ? Result.Failure<JobResponse>("İlan bulunamadı.", 404)
            : Result.Success(ToResponse(job, job.Employer.FullName));
    }

    public async Task<Result<IReadOnlyList<JobResponse>>> ListMineAsync(CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            return Result.Failure<IReadOnlyList<JobResponse>>("Yetkisiz işlem.", 401);
        if (_currentUser.Role != UserRole.Employer)
            return Result.Failure<IReadOnlyList<JobResponse>>("Yalnızca işverenler kendi ilanlarını görebilir.", 403);

        var employerId = _currentUser.UserId.Value;
        var items = await _unitOfWork.Jobs.Query()
            .Include(j => j.Employer)
            .Where(j => j.EmployerId == employerId)
            .OrderByDescending(j => j.CreatedAt)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        IReadOnlyList<JobResponse> mapped = items
            .Select(j => ToResponse(j, j.Employer.FullName))
            .ToList();
        return Result.Success(mapped);
    }

    public IReadOnlyList<string> GetDistricts() => IstanbulDistricts.All;

    private static JobResponse ToResponse(JobAdvertisement j, string employerName) => new(
        j.Id, j.EmployerId, employerName,
        j.Title, j.Description, j.District, j.Address,
        j.JobDate, j.StartTime, j.EndTime,
        j.Price, j.ProvidesFood, j.ProvidesTransport,
        j.IsActive, j.CreatedAt);
}
