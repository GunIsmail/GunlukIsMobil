namespace GunlukIs.Application.Features.Chat.Dtos;

public record SendMessageRequest(Guid ApplicationId, string Content);
