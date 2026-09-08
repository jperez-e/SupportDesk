namespace SupportDesk.API.DTOs;

public class TicketResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; }= string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public UserResponseDto? User { get; set; }
    public int UserId { get; set; }

    public int CategoryId { get; set; }

    public CategoryResponseDto? Category { get; set; }

    public UserResponseDto? AssignedToUser { get; set; }
}