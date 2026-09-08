using SupportDesk.API.DTOs;

namespace SupportDesk.API.Services;

public interface IAuthService
{
    Task<AuthResponsedto?> RegisterAsync(RegisterDto dto);
    Task<AuthResponsedto?> LoginAsync(LoginDto dto);
    Task<AuthResponsedto> ChangePasswordAsync(
    int userId,
    ChangePasswordDto dto);
}
