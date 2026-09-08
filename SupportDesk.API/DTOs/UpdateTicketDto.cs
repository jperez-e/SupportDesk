using System.ComponentModel.DataAnnotations;

namespace SupportDesk.API.DTOs;

public class UpdateTicketDto
{
    [Required]
    [StringLength(100, MinimumLength = 5)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(500, MinimumLength = 10)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [RegularExpression(
        "Low|Medium|High|Critical",
        ErrorMessage = "La prioridad debe ser Low, Medium, High o Critical."
    )]
    public string Priority { get; set; } = "Medium";

    [Range(
    1,
    int.MaxValue,
    ErrorMessage = "Debe seleccionar una categoría válida."
)]
    public int CategoryId { get; set; }
}