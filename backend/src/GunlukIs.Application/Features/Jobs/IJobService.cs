using GunlukIs.Application.Common.Results;
using GunlukIs.Application.Features.Jobs.Dtos;

namespace GunlukIs.Application.Features.Jobs;

public interface IJobService
{
    Task<Result<JobResponse>> CreateAsync(CreateJobRequest request, CancellationToken cancellationToken = default);
    Task<Result<IReadOnlyList<JobResponse>>> ListAsync(JobFilterRequest filter, CancellationToken cancellationToken = default);
    Task<Result<JobResponse>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<IReadOnlyList<JobResponse>>> ListMineAsync(CancellationToken cancellationToken = default);
    IReadOnlyList<string> GetDistricts();
}
