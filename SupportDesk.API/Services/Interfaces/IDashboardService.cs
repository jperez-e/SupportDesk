using SupportDesk.API.DTOs;

namespace SupportDesk.API.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync();
}
