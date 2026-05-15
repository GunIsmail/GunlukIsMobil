using GunlukIs.Domain.Common;

namespace GunlukIs.Domain.Entities;

public class ChatMessage : BaseEntity
{
    public Guid ApplicationId { get; private set; }
    public Application Application { get; private set; } = null!;

    public Guid SenderId { get; private set; }
    public User Sender { get; private set; } = null!;

    public string Content { get; private set; } = null!;
    public bool IsRead { get; private set; }

    private ChatMessage() { }

    public ChatMessage(Guid applicationId, Guid senderId, string content)
    {
        ApplicationId = applicationId;
        SenderId = senderId;
        Content = content;
    }

    public void MarkAsRead()
    {
        if (IsRead) return;
        IsRead = true;
        SetUpdated();
    }
}
