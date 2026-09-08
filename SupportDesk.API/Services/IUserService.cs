using SupportDesk.API.DTOs;

namespace SupportDesk.API.Services;

public interface IUserService
{
    Task<List<UserResponseDto>> GetAllAsync();
    Task<UserResponseDto?> GetByIdAsync(int id);
    Task<UserResponseDto?> UpdateAsync( int id, UpdateUserDto dto);
    Task<bool> DeleteAsync(int id);
    Task<UserResponseDto?> UpdateRoleAsync(int id, UpdateUserRoleDto dto);

    Task<UserResponseDto?> UpdateStatusAsync(int id, UpdateUserStatusDto dto, int currentUserId);
}
