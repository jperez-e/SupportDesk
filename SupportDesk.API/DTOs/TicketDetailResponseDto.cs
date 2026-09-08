namespace SupportDesk.API.DTOs;

public class TicketDetailResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public UserResponseDto? User { get; set; }

    public CategoryResponseDto? Category { get; set; }
    public List<CommentDetailResponseDto> Comments { get; set; } = new();
    public UserResponseDto? AssignedToUser { get; set; }

}
