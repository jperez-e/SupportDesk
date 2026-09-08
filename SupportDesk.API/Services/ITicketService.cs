using Microsoft.AspNetCore.Mvc.Razor;
using SupportDesk.API.DTOs;

namespace SupportDesk.API.Services
{
    public interface ITicketService
    {
        Task<PagedResultDto<TicketResponseDto>> GetAllAsync( TicketQueryParameters parameters, int userId, string role);
        Task<TicketResponseDto?> GetByIdAsync(int id, int userId, string role);
        Task<TicketDetailResponseDto?> GetDetailByIdAsync(int id, int userId, string role);
        Task<TicketResponseDto> CreateAsync(CreateTicketDto dto, int userId);
        Task<TicketResponseDto?> UpdateAsync(int id, UpdateTicketDto dto, int userId, string role);
        Task<bool> DeleteAsync(int id, int userId, string role);
        Task<TicketResponseDto?> UpdateStatusAsync(int id, UpdateTicketStatusDto dto, int userId, string role);
        Task<TicketResponseDto?> AssignAsync(int id, AssignTicketDto dto, int userId);
        Task<TicketResponseDto?> UnassignAsync(int id, int userId);
        Task<List<TicketResponseDto>> GetDeletedAsync();
        Task<TicketResponseDto?> RestoreAsync(int id, int userId);

        Task<PagedResultDto<TicketHistoryResponseDto>> GetHistoryAsync(int ticketId, int userId, string role, TicketHistoryQueryParameters parameters);
    }
}
