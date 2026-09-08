using System.ComponentModel.DataAnnotations;

namespace SupportDesk.API.DTOs;

public class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [MinLength(
        8,
        ErrorMessage = "La nueva contraseña debe tener al menos 8 caracteres."
    )]
    public string NewPassword { get; set; } = string.Empty;

    [Required]
    [Compare(
        nameof(NewPassword),
        ErrorMessage = "La confirmación de la contraseña no coincide."
    )]
    public string ConfirmPassword { get; set; } = string.Empty;
}
