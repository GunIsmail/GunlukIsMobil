using GunlukIs.Application.Common.Persistence;
using GunlukIs.Application.Common.Results;
using GunlukIs.Application.Common.Security;
using GunlukIs.Application.Features.Ratings.Dtos;
using GunlukIs.Domain.Entities;
using GunlukIs.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using DomainApplication = GunlukIs.Domain.Entities.Application;

namespace GunlukIs.Application.Features.Ratings;

public class RatingService : IRatingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public RatingService(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<Result> RateWorkerAsync(RateWorkerRequest request, CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            return Result.Failure("Yetkisiz işlem.", 401);
        if (_currentUser.Role != UserRole.Employer)
            return Result.Failure("Yalnızca işverenler çalışanları değerlendirebilir.", 403);

        var application = await LoadApplication(request.ApplicationId, cancellationToken);
        if (application is null)
            return Result.Failure("Başvuru bulunamadı.", 404);
        if (application.JobAdvertisement.EmployerId != _currentUser.UserId.Value)
            return Result.Failure("Bu başvuruyu değerlendirme yetkiniz yok.", 403);
        if (application.Status != ApplicationStatus.Accepted)
            return Result.Failure("Yalnızca kabul edilmiş başvurular değerlendirilebilir.", 400);

        var exists = await _unitOfWork.WorkerRatings.AnyAsync(
            r => r.ApplicationId == request.ApplicationId, cancellationToken);
        if (exists)
            return Result.Failure("Bu başvuru için zaten değerlendirme yapıldı.", 409);

        var rating = new WorkerRating(
            request.ApplicationId,
            application.WorkerId,
            _currentUser.UserId.Value,
            request.Communication,
            request.ServiceSpeed,
            request.Teamwork,
            request.Comment?.Trim());

        await _unitOfWork.WorkerRatings.AddAsync(rating, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(201);
    }

    public async Task<Result> RateEmployerAsync(RateEmployerRequest request, CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            return Result.Failure("Yetkisiz işlem.", 401);
        if (_currentUser.Role != UserRole.Worker)
            return Result.Failure("Yalnızca çalışanlar işverenleri değerlendirebilir.", 403);

        var application = await LoadApplication(request.ApplicationId, cancellationToken);
        if (application is null)
            return Result.Failure("Başvuru bulunamadı.", 404);
        if (application.WorkerId != _currentUser.UserId.Value)
            return Result.Failure("Bu başvuruyu değerlendirme yetkiniz yok.", 403);
        if (application.Status != ApplicationStatus.Accepted)
            return Result.Failure("Yalnızca kabul edilmiş başvurular değerlendirilebilir.", 400);

        var exists = await _unitOfWork.EmployerRatings.AnyAsync(
            r => r.ApplicationId == request.ApplicationId, cancellationToken);
        if (exists)
            return Result.Failure("Bu başvuru için zaten değerlendirme yapıldı.", 409);

        var rating = new EmployerRating(
            request.ApplicationId,
            application.JobAdvertisement.EmployerId,
            _currentUser.UserId.Value,
            request.WorkingConditions,
            request.PaymentReliability,
            request.ManagementStyle,
            request.Comment?.Trim());

        await _unitOfWork.EmployerRatings.AddAsync(rating, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(201);
    }

    public async Task<Result<WorkerRatingSummaryResponse>> GetWorkerSummaryAsync(Guid workerId, CancellationToken cancellationToken = default)
    {
        var worker = await _unitOfWork.Users.GetByIdAsync(workerId, cancellationToken);
        if (worker is null)
            return Result.Failure<WorkerRatingSummaryResponse>("Kullanıcı bulunamadı.", 404);

        var ratings = await _unitOfWork.WorkerRatings.Query()
            .Where(r => r.WorkerId == workerId)
            .ToListAsync(cancellationToken);

        if (ratings.Count == 0)
            return Result.Success(new WorkerRatingSummaryResponse(workerId, worker.FullName, 0, 0, 0, 0, 0));

        var summary = new WorkerRatingSummaryResponse(
            workerId,
            worker.FullName,
            ratings.Count,
            Math.Round(ratings.Average(r => r.Average), 2),
            Math.Round(ratings.Average(r => r.Communication), 2),
            Math.Round(ratings.Average(r => r.ServiceSpeed), 2),
            Math.Round(ratings.Average(r => r.Teamwork), 2));

        return Result.Success(summary);
    }

    public async Task<Result<EmployerRatingSummaryResponse>> GetEmployerSummaryAsync(Guid employerId, CancellationToken cancellationToken = default)
    {
        var employer = await _unitOfWork.Users.GetByIdAsync(employerId, cancellationToken);
        if (employer is null)
            return Result.Failure<EmployerRatingSummaryResponse>("Kullanıcı bulunamadı.", 404);

        var ratings = await _unitOfWork.EmployerRatings.Query()
            .Where(r => r.EmployerId == employerId)
            .ToListAsync(cancellationToken);

        if (ratings.Count == 0)
            return Result.Success(new EmployerRatingSummaryResponse(employerId, employer.FullName, 0, 0, 0, 0, 0));

        var summary = new EmployerRatingSummaryResponse(
            employerId,
            employer.FullName,
            ratings.Count,
            Math.Round(ratings.Average(r => r.Average), 2),
            Math.Round(ratings.Average(r => r.WorkingConditions), 2),
            Math.Round(ratings.Average(r => r.PaymentReliability), 2),
            Math.Round(ratings.Average(r => r.ManagementStyle), 2));

        return Result.Success(summary);
    }

    private Task<DomainApplication?> LoadApplication(Guid applicationId, CancellationToken cancellationToken) =>
        _unitOfWork.Applications.Query()
            .Include(a => a.JobAdvertisement)
            .FirstOrDefaultAsync(a => a.Id == applicationId, cancellationToken);
}
