using FluentValidation;
using GunlukIs.Application.Features.Ratings;
using GunlukIs.Application.Features.Ratings.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GunlukIs.WebAPI.Controllers;

[Authorize]
[Route("api/ratings")]
public class RatingsController : ApiControllerBase
{
    private readonly IRatingService _ratingService;
    private readonly IValidator<RateWorkerRequest> _rateWorkerValidator;
    private readonly IValidator<RateEmployerRequest> _rateEmployerValidator;

    public RatingsController(
        IRatingService ratingService,
        IValidator<RateWorkerRequest> rateWorkerValidator,
        IValidator<RateEmployerRequest> rateEmployerValidator)
    {
        _ratingService = ratingService;
        _rateWorkerValidator = rateWorkerValidator;
        _rateEmployerValidator = rateEmployerValidator;
    }

    [HttpPost("worker")]
    public async Task<IActionResult> RateWorker([FromBody] RateWorkerRequest request, CancellationToken cancellationToken)
    {
        await _rateWorkerValidator.ValidateAndThrowAsync(request, cancellationToken);
        return ToActionResult(await _ratingService.RateWorkerAsync(request, cancellationToken));
    }

    [HttpPost("employer")]
    public async Task<IActionResult> RateEmployer([FromBody] RateEmployerRequest request, CancellationToken cancellationToken)
    {
        await _rateEmployerValidator.ValidateAndThrowAsync(request, cancellationToken);
        return ToActionResult(await _ratingService.RateEmployerAsync(request, cancellationToken));
    }

    [HttpGet("worker/{workerId:guid}")]
    public async Task<IActionResult> WorkerSummary(Guid workerId, CancellationToken cancellationToken) =>
        ToActionResult(await _ratingService.GetWorkerSummaryAsync(workerId, cancellationToken));

    [HttpGet("employer/{employerId:guid}")]
    public async Task<IActionResult> EmployerSummary(Guid employerId, CancellationToken cancellationToken) =>
        ToActionResult(await _ratingService.GetEmployerSummaryAsync(employerId, cancellationToken));
}
