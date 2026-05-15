using GunlukIs.Application.Common.Security;
using GunlukIs.Application.Features.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GunlukIs.WebAPI.Controllers;

[Authorize]
[Route("api/chat")]
public class ChatController : ApiControllerBase
{
    private readonly IChatService _chatService;
    private readonly ICurrentUserService _currentUser;

    public ChatController(IChatService chatService, ICurrentUserService currentUser)
    {
        _chatService = chatService;
        _currentUser = currentUser;
    }

    [HttpGet("history/{applicationId:guid}")]
    public async Task<IActionResult> History(Guid applicationId, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Unauthorized();

        if (!await _chatService.CanParticipateAsync(applicationId, _currentUser.UserId.Value, cancellationToken))
            return Forbid();

        return ToActionResult(await _chatService.GetHistoryAsync(applicationId, cancellationToken));
    }
}
