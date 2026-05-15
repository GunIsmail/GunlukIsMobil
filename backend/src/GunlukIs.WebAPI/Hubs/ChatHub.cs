using System.Security.Claims;
using GunlukIs.Application.Features.Chat;
using GunlukIs.Application.Features.Chat.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace GunlukIs.WebAPI.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IChatService _chatService;

    public ChatHub(IChatService chatService)
    {
        _chatService = chatService;
    }

    public async Task JoinConversation(Guid applicationId)
    {
        var userId = GetUserId();
        if (userId is null) throw new HubException("Unauthorized.");

        if (!await _chatService.CanParticipateAsync(applicationId, userId.Value, Context.ConnectionAborted))
            throw new HubException("You are not allowed to participate in this conversation.");

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(applicationId));
    }

    public async Task LeaveConversation(Guid applicationId) =>
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(applicationId));

    public async Task SendMessage(SendMessageRequest request)
    {
        var userId = GetUserId();
        if (userId is null) throw new HubException("Unauthorized.");

        var result = await _chatService.SendAsync(userId.Value, request, Context.ConnectionAborted);
        if (result.IsFailure)
            throw new HubException(result.Error);

        await Clients.Group(GroupName(request.ApplicationId)).SendAsync("ReceiveMessage", result.Value);
    }

    private Guid? GetUserId()
    {
        var value = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out var id) ? id : null;
    }

    private static string GroupName(Guid applicationId) => $"app:{applicationId}";
}
