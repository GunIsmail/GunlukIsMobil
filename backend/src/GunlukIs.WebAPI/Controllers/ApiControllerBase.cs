using GunlukIs.Application.Common.Results;
using Microsoft.AspNetCore.Mvc;

namespace GunlukIs.WebAPI.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult ToActionResult<T>(Result<T> result) =>
        result.IsSuccess
            ? StatusCode(result.StatusCode, result.Value)
            : StatusCode(result.StatusCode, new { statusCode = result.StatusCode, message = result.Error });

    protected IActionResult ToActionResult(Result result) =>
        result.IsSuccess
            ? StatusCode(result.StatusCode)
            : StatusCode(result.StatusCode, new { statusCode = result.StatusCode, message = result.Error });
}
