using System.ComponentModel.DataAnnotations;
namespace SupportDesk.API.DTOs;

public class CreateCommentDto
{
    [Required]
    [StringLength(1000, MinimumLength = 1)]
    public string Content { get; set; } = string.Empty;

    [Required]
    public int TicketId { get; set; }
}
