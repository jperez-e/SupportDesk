using System.ComponentModel.DataAnnotations;

namespace SupportDesk.API.DTOs;

public class UpdateCategoryDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [StringLength(300)]
    public string Description { get; set; } = string.Empty; 
}
