using GunlukIs.Application.Common.Results;
using GunlukIs.Application.Features.Chat.Dtos;

namespace GunlukIs.Application.Features.Chat;

public interface IChatService
{
    Task<Result<ChatMessageResponse>> SendAsync(Guid senderId, SendMessageRequest request, CancellationToken cancellationToken = default);
    Task<Result<IReadOnlyList<ChatMessageResponse>>> GetHistoryAsync(Guid applicationId, CancellationToken cancellationToken = default);
    Task<bool> CanParticipateAsync(Guid applicationId, Guid userId, CancellationToken cancellationToken = default);
}
