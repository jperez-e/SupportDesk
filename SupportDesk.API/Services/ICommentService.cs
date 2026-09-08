using SupportDesk.API.DTOs;

namespace SupportDesk.API.Services;

public interface ICommentService
{
    Task<List<CommentResponseDto>> GetByTicketIdAsync(
       int ticketId, int userId, string role);

    Task<CommentResponseDto?> GetByIdAsync(int id, int userId, string role);

    Task<CommentResponseDto> CreateAsync(
        CreateCommentDto dto, int userId, string role);

    Task<bool> DeleteAsync(int id, int userId, string role);

}
