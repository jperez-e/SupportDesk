namespace SupportDesk.API.DTOs;

public class CommentDetailResponseDto
{
    public int Id { get; set; }

    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public UserResponseDto? User { get; set; }
}
