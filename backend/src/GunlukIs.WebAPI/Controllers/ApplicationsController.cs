using FluentValidation;
using GunlukIs.Application.Features.Applications;
using GunlukIs.Application.Features.Applications.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GunlukIs.WebAPI.Controllers;

[Authorize]
[Route("api/applications")]
public class ApplicationsController : ApiControllerBase
{
    private readonly IApplicationService _applicationService;
    private readonly IValidator<ApplyToJobRequest> _applyValidator;

    public ApplicationsController(IApplicationService applicationService, IValidator<ApplyToJobRequest> applyValidator)
    {
        _applicationService = applicationService;
        _applyValidator = applyValidator;
    }

    [HttpPost]
    public async Task<IActionResult> Apply([FromBody] ApplyToJobRequest request, CancellationToken cancellationToken)
    {
        await _applyValidator.ValidateAndThrowAsync(request, cancellationToken);
        return ToActionResult(await _applicationService.ApplyAsync(request, cancellationToken));
    }

    [HttpGet("mine")]
    public async Task<IActionResult> ListMine(CancellationToken cancellationToken) =>
        ToActionResult(await _applicationService.ListMineAsync(cancellationToken));

    [HttpGet("conversations")]
    public async Task<IActionResult> Conversations(CancellationToken cancellationToken) =>
        ToActionResult(await _applicationService.ListConversationsAsync(cancellationToken));

    [HttpGet("by-job/{jobId:guid}")]
    public async Task<IActionResult> ListByJob(Guid jobId, CancellationToken cancellationToken) =>
        ToActionResult(await _applicationService.ListByJobAsync(jobId, cancellationToken));

    [HttpPost("{id:guid}/accept")]
    public async Task<IActionResult> Accept(Guid id, CancellationToken cancellationToken) =>
        ToActionResult(await _applicationService.AcceptAsync(id, cancellationToken));

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, CancellationToken cancellationToken) =>
        ToActionResult(await _applicationService.RejectAsync(id, cancellationToken));
}
