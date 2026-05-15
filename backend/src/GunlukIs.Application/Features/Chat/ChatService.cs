using GunlukIs.Application.Common.Persistence;
using GunlukIs.Application.Common.Results;
using GunlukIs.Application.Features.Chat.Dtos;
using GunlukIs.Domain.Entities;
using GunlukIs.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace GunlukIs.Application.Features.Chat;

public class ChatService : IChatService
{
    private readonly IUnitOfWork _unitOfWork;

    public ChatService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ChatMessageResponse>> SendAsync(Guid senderId, SendMessageRequest request, CancellationToken cancellationToken = default)
    {
        var application = await _unitOfWork.Applications.Query()
            .Include(a => a.JobAdvertisement)
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId, cancellationToken);

        if (application is null)
            return Result.Failure<ChatMessageResponse>("Başvuru bulunamadı.", 404);

        if (application.Status != ApplicationStatus.Accepted)
            return Result.Failure<ChatMessageResponse>("Sohbet yalnızca kabul edilmiş başvurularda yapılabilir.", 403);

        if (application.WorkerId != senderId && application.JobAdvertisement.EmployerId != senderId)
            return Result.Failure<ChatMessageResponse>("Bu sohbetin katılımcısı değilsiniz.", 403);

        var message = new ChatMessage(request.ApplicationId, senderId, request.Content.Trim());
        await _unitOfWork.ChatMessages.AddAsync(message, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var sender = await _unitOfWork.Users.GetByIdAsync(senderId, cancellationToken);
        return Result.Success(ToResponse(message, sender?.FullName ?? string.Empty), 201);
    }

    public async Task<Result<IReadOnlyList<ChatMessageResponse>>> GetHistoryAsync(Guid applicationId, CancellationToken cancellationToken = default)
    {
        var messages = await _unitOfWork.ChatMessages.Query()
            .Include(m => m.Sender)
            .Where(m => m.ApplicationId == applicationId)
            .OrderBy(m => m.CreatedAt)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        IReadOnlyList<ChatMessageResponse> mapped = messages
            .Select(m => ToResponse(m, m.Sender.FullName))
            .ToList();
        return Result.Success(mapped);
    }

    public async Task<bool> CanParticipateAsync(Guid applicationId, Guid userId, CancellationToken cancellationToken = default)
    {
        var application = await _unitOfWork.Applications.Query()
            .Include(a => a.JobAdvertisement)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == applicationId, cancellationToken);

        if (application is null) return false;
        if (application.Status != ApplicationStatus.Accepted) return false;
        return application.WorkerId == userId || application.JobAdvertisement.EmployerId == userId;
    }

    private static ChatMessageResponse ToResponse(ChatMessage m, string senderName) => new(
        m.Id, m.ApplicationId, m.SenderId, senderName, m.Content, m.IsRead, m.CreatedAt);
}
