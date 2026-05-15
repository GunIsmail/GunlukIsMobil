using GunlukIs.Application.Common.Results;
using GunlukIs.Application.Features.Applications.Dtos;

namespace GunlukIs.Application.Features.Applications;

public interface IApplicationService
{
    Task<Result<ApplicationResponse>> ApplyAsync(ApplyToJobRequest request, CancellationToken cancellationToken = default);
    Task<Result<IReadOnlyList<ApplicationResponse>>> ListByJobAsync(Guid jobId, CancellationToken cancellationToken = default);
    Task<Result<IReadOnlyList<ApplicationResponse>>> ListMineAsync(CancellationToken cancellationToken = default);
    Task<Result<IReadOnlyList<ApplicationResponse>>> ListConversationsAsync(CancellationToken cancellationToken = default);
    Task<Result<ApplicationResponse>> AcceptAsync(Guid applicationId, CancellationToken cancellationToken = default);
    Task<Result<ApplicationResponse>> RejectAsync(Guid applicationId, CancellationToken cancellationToken = default);
}
