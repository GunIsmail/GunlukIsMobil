using FluentValidation;
using GunlukIs.Application.Features.Jobs;
using GunlukIs.Application.Features.Jobs.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GunlukIs.WebAPI.Controllers;

[Route("api/jobs")]
public class JobsController : ApiControllerBase
{
    private readonly IJobService _jobService;
    private readonly IValidator<CreateJobRequest> _createValidator;

    public JobsController(IJobService jobService, IValidator<CreateJobRequest> createValidator)
    {
        _jobService = jobService;
        _createValidator = createValidator;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] JobFilterRequest filter, CancellationToken cancellationToken) =>
        ToActionResult(await _jobService.ListAsync(filter, cancellationToken));

    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken) =>
        ToActionResult(await _jobService.GetByIdAsync(id, cancellationToken));

    [AllowAnonymous]
    [HttpGet("districts")]
    public IActionResult GetDistricts() => Ok(_jobService.GetDistricts());

    [Authorize]
    [HttpGet("mine")]
    public async Task<IActionResult> ListMine(CancellationToken cancellationToken) =>
        ToActionResult(await _jobService.ListMineAsync(cancellationToken));

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateJobRequest request, CancellationToken cancellationToken)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);
        return ToActionResult(await _jobService.CreateAsync(request, cancellationToken));
    }
}
