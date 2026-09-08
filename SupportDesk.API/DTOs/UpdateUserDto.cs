using System.ComponentModel.DataAnnotations;

namespace SupportDesk.API.DTOs;

public class UpdateUserDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
