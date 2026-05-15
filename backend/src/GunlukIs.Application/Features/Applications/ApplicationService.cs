using GunlukIs.Application.Common.Persistence;
using GunlukIs.Application.Common.Results;
using GunlukIs.Application.Common.Security;
using GunlukIs.Application.Features.Applications.Dtos;
using GunlukIs.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using DomainApplication = GunlukIs.Domain.Entities.Application;

namespace GunlukIs.Application.Features.Applications;

public class ApplicationService : IApplicationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ApplicationService(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<Result<ApplicationResponse>> ApplyAsync(ApplyToJobRequest request, CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            return Result.Failure<ApplicationResponse>("Yetkisiz işlem.", 401);
        if (_currentUser.Role != UserRole.Worker)
            return Result.Failure<ApplicationResponse>("Yalnızca çalışanlar ilana başvurabilir.", 403);

        var workerId = _currentUser.UserId.Value;
        var job = await _unitOfWork.Jobs.GetByIdAsync(request.JobAdvertisementId, cancellationToken);
        if (job is null || !job.IsActive)
            return Result.Failure<ApplicationResponse>("İlan mevcut değil.", 404);
        if (job.EmployerId == workerId)
            return Result.Failure<ApplicationResponse>("Kendi ilanınıza başvuramazsınız.", 400);

        var duplicate = await _unitOfWork.Applications.AnyAsync(
            a => a.JobAdvertisementId == request.JobAdvertisementId && a.WorkerId == workerId,
            cancellationToken);
        if (duplicate)
            return Result.Failure<ApplicationResponse>("Bu ilana zaten başvurdunuz.", 409);

        var application = new DomainApplication(request.JobAdvertisementId, workerId, request.Message?.Trim());
        await _unitOfWork.Applications.AddAsync(application, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(await LoadResponseAsync(application.Id, cancellationToken), 201);
    }

    public async Task<Result<IReadOnlyList<ApplicationResponse>>> ListByJobAsync(Guid jobId, CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            return Result.Failure<IReadOnlyList<ApplicationResponse>>("Yetkisiz işlem.", 401);
        if (_currentUser.Role != UserRole.Employer)
            return Result.Failure<IReadOnlyList<ApplicationResponse>>("Yalnızca işverenler başvuruları görebilir.", 403);

        var job = await _unitOfWork.Jobs.GetByIdAsync(jobId, cancellationToken);
        if (job is null)
            return Result.Failure<IReadOnlyList<ApplicationResponse>>("İlan bulunamadı.", 404);
        if (job.EmployerId != _currentUser.UserId.Value)
            return Result.Failure<IReadOnlyList<ApplicationResponse>>("Bu ilan size ait değil.", 403);

        var items = await BaseQuery()
            .Where(a => a.JobAdvertisementId == jobId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);

        IReadOnlyList<ApplicationResponse> mapped = items.Select(ToResponse).ToList();
        return Result.Success(mapped);
    }

    public async Task<Result<IReadOnlyList<ApplicationResponse>>> ListMineAsync(CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            return Result.Failure<IReadOnlyList<ApplicationResponse>>("Yetkisiz işlem.", 401);
        if (_currentUser.Role != UserRole.Worker)
            return Result.Failure<IReadOnlyList<ApplicationResponse>>("Yalnızca çalışanlar kendi başvurularını görebilir.", 403);

        var workerId = _currentUser.UserId.Value;
        var items = await BaseQuery()
            .Where(a => a.WorkerId == workerId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);

        IReadOnlyList<ApplicationResponse> mapped = items.Select(ToResponse).ToList();
        return Result.Success(mapped);
    }

    public async Task<Result<IReadOnlyList<ApplicationResponse>>> ListConversationsAsync(CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            return Result.Failure<IReadOnlyList<ApplicationResponse>>("Yetkisiz işlem.", 401);

        var userId = _currentUser.UserId.Value;
        var query = BaseQuery().Where(a => a.Status == ApplicationStatus.Accepted);

        query = _currentUser.Role == UserRole.Employer
            ? query.Where(a => a.JobAdvertisement.EmployerId == userId)
            : query.Where(a => a.WorkerId == userId);

        var items = await query
            .OrderByDescending(a => a.UpdatedAt ?? a.CreatedAt)
            .ToListAsync(cancellationToken);

        IReadOnlyList<ApplicationResponse> mapped = items.Select(ToResponse).ToList();
        return Result.Success(mapped);
    }

    public async Task<Result<ApplicationResponse>> AcceptAsync(Guid applicationId, CancellationToken cancellationToken = default) =>
        await ChangeStatusAsync(applicationId, app => app.Accept(), cancellationToken);

    public async Task<Result<ApplicationResponse>> RejectAsync(Guid applicationId, CancellationToken cancellationToken = default) =>
        await ChangeStatusAsync(applicationId, app => app.Reject(), cancellationToken);

    private async Task<Result<ApplicationResponse>> ChangeStatusAsync(Guid applicationId, Action<DomainApplication> action, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            return Result.Failure<ApplicationResponse>("Yetkisiz işlem.", 401);
        if (_currentUser.Role != UserRole.Employer)
            return Result.Failure<ApplicationResponse>("Yalnızca işverenler başvuruları yönetebilir.", 403);

        var application = await _unitOfWork.Applications.Query()
            .Include(a => a.JobAdvertisement)
            .FirstOrDefaultAsync(a => a.Id == applicationId, cancellationToken);

        if (application is null)
            return Result.Failure<ApplicationResponse>("Başvuru bulunamadı.", 404);
        if (application.JobAdvertisement.EmployerId != _currentUser.UserId.Value)
            return Result.Failure<ApplicationResponse>("Bu ilan size ait değil.", 403);
        if (application.Status != ApplicationStatus.Pending)
            return Result.Failure<ApplicationResponse>("Yalnızca bekleyen başvurular güncellenebilir.", 400);

        action(application);
        _unitOfWork.Applications.Update(application);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(await LoadResponseAsync(applicationId, cancellationToken));
    }

    private IQueryable<DomainApplication> BaseQuery() =>
        _unitOfWork.Applications.Query()
            .Include(a => a.JobAdvertisement)
            .Include(a => a.Worker)
            .AsNoTracking();

    private async Task<ApplicationResponse> LoadResponseAsync(Guid id, CancellationToken cancellationToken)
    {
        var entity = await BaseQuery().FirstAsync(a => a.Id == id, cancellationToken);
        return ToResponse(entity);
    }

    private static ApplicationResponse ToResponse(DomainApplication a) => new(
        a.Id,
        a.JobAdvertisementId,
        a.JobAdvertisement.Title,
        a.WorkerId,
        a.Worker.FullName,
        a.Worker.PhoneNumber,
        a.Message,
        a.Status,
        a.CreatedAt);
}
