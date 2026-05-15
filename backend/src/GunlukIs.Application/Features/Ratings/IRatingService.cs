using GunlukIs.Application.Common.Results;
using GunlukIs.Application.Features.Ratings.Dtos;

namespace GunlukIs.Application.Features.Ratings;

public interface IRatingService
{
    Task<Result> RateWorkerAsync(RateWorkerRequest request, CancellationToken cancellationToken = default);
    Task<Result> RateEmployerAsync(RateEmployerRequest request, CancellationToken cancellationToken = default);
    Task<Result<WorkerRatingSummaryResponse>> GetWorkerSummaryAsync(Guid workerId, CancellationToken cancellationToken = default);
    Task<Result<EmployerRatingSummaryResponse>> GetEmployerSummaryAsync(Guid employerId, CancellationToken cancellationToken = default);
}
