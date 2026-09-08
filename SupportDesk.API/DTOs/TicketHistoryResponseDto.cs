namespace SupportDesk.API.DTOs;

public class TicketHistoryResponseDto
{
    public int Id { get; set; }

    public int TicketId { get; set; }

    public int UserId { get; set; }

    public string Action { get; set; } = string.Empty;

    public string? OldValue { get; set; }

    public string? NewValue { get; set; }

    public DateTime CreatedAt { get; set; }

    public UserResponseDto? User { get; set; }

    public string? FieldName { get; set; }
}
