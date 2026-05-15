namespace GunlukIs.Application.Features.Chat.Dtos;

public record ChatMessageResponse(
    Guid Id,
    Guid ApplicationId,
    Guid SenderId,
    string SenderName,
    string Content,
    bool IsRead,
    DateTime CreatedAt);
