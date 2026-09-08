using Microsoft.EntityFrameworkCore;
using SupportDesk.API.Constants;
using SupportDesk.API.Data;
using SupportDesk.API.DTOs;
using SupportDesk.API.Services.Interfaces;

namespace SupportDesk.API.Services;

public class DashboardService : IDashboardService
{
    private readonly SupportDeskDbContext _context;

    public DashboardService(SupportDeskDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync()
    {
        // Resumen general de tickets
        var ticketStats = await _context.Tickets
            .AsNoTracking()
            .GroupBy(t => 1)
            .Select(group => new
            {
                TotalTickets = group.Count(),

                OpenTickets = group.Count(
                    t => t.Status == TicketStatuses.Open),

                InProgressTickets = group.Count(
                    t => t.Status == TicketStatuses.InProgress),

                ResolvedTickets = group.Count(
                    t => t.Status == TicketStatuses.Resolved),

                ClosedTickets = group.Count(
                    t => t.Status == TicketStatuses.Closed),

                LowPriorityTickets = group.Count(
                    t => t.Priority == TicketPriorities.Low),

                MediumPriorityTickets = group.Count(
                    t => t.Priority == TicketPriorities.Medium),

                HighPriorityTickets = group.Count(
                    t => t.Priority == TicketPriorities.High),

                CriticalPriorityTickets = group.Count(
                    t => t.Priority == TicketPriorities.Critical),

                UnassignedTickets = group.Count(
    t =>
        t.AssignedToUserId == null &&
        (
            t.Status == TicketStatuses.Open ||
            t.Status == TicketStatuses.InProgress
        ))
            })
            .FirstOrDefaultAsync();

        // Tickets agrupados por categoría
        var ticketsByCategory = await _context.Tickets
            .AsNoTracking()
            .GroupBy(t => new
            {
                t.CategoryId,
                CategoryName = t.Category!.Name
            })
            .Select(group => new TicketsByCategoryDto
            {
                CategoryId = group.Key.CategoryId,
                CategoryName = group.Key.CategoryName,
                TicketCount = group.Count()
            })
            .OrderByDescending(x => x.TicketCount)
            .ToListAsync();

        // Tickets agrupados por agente
        // Carga de trabajo activa por agente
        var ticketsByAgent = await _context.Tickets
            .AsNoTracking()
            .Where(t =>
                t.AssignedToUserId != null &&
                (
                    t.Status == TicketStatuses.Open ||
                    t.Status == TicketStatuses.InProgress
                ))
            .GroupBy(t => new
            {
                AgentId = t.AssignedToUserId!.Value,
                AgentName = t.AssignedToUser!.Name
            })
            .Select(group => new TicketsByAgentDto
            {
                AgentId = group.Key.AgentId,
                AgentName = group.Key.AgentName,
                TicketCount = group.Count()
            })
            .OrderByDescending(
                x => x.TicketCount
            )
            .ToListAsync();

        // Últimos 7 días, incluyendo hoy
        var sevenDaysAgo = DateTime.UtcNow.Date.AddDays(-6);

        var ticketsLast7Days = await _context.Tickets
            .AsNoTracking()
            .CountAsync(t => t.CreatedAt >= sevenDaysAgo);

        // Datos existentes en SQL por día
        var ticketsByDayData = await _context.Tickets
            .AsNoTracking()
            .Where(t => t.CreatedAt >= sevenDaysAgo)
            .GroupBy(t => t.CreatedAt.Date)
            .Select(group => new TicketsByDayDto
            {
                Date = group.Key,
                TicketCount = group.Count()
            })
            .OrderBy(x => x.Date)
            .ToListAsync();

        // Garantizamos exactamente 7 días,
        // incluyendo días donde no hubo tickets.
        var today = DateTime.UtcNow.Date;

        var ticketsByDay = Enumerable
            .Range(0, 7)
            .Select(i => today.AddDays(-6 + i))
            .Select(date => new TicketsByDayDto
            {
                Date = date,
                TicketCount = ticketsByDayData
                    .FirstOrDefault(x => x.Date == date)?
                    .TicketCount ?? 0
            })
            .ToList();

        // Tiempo promedio global de resolución
        var resolvedTicketsData = await _context.Tickets
            .AsNoTracking()
            .Where(t => t.ResolvedAt != null)
            .Select(t => new
            {
                t.CreatedAt,
                ResolvedAt = t.ResolvedAt!.Value
            })
            .ToListAsync();

        var averageResolutionHours = resolvedTicketsData.Count == 0
            ? 0
            : resolvedTicketsData
                .Average(t =>
                    (t.ResolvedAt - t.CreatedAt).TotalHours);

        // Eventos de resolución realizados específicamente por agentes
        var resolutionEvents = await _context.TicketHistories
            .AsNoTracking()
            .Where(h =>
                h.Action == TicketHistoryActions.StatusChanged &&
                h.FieldName == TicketHistoryFields.Status &&
                h.NewValue == TicketStatuses.Resolved &&
                h.User!.Role == UserRoles.Agent)
            .Select(h => new
            {
                h.UserId,
                UserName = h.User!.Name,
                h.TicketId,
                TicketCreatedAt = h.Ticket!.CreatedAt,
                ResolvedAt = h.CreatedAt
            })
            .ToListAsync();

        // Rendimiento por agente
        var agentPerformance = resolutionEvents
            .GroupBy(x => new
            {
                x.UserId,
                x.UserName
            })
            .Select(group => new AgentPerformanceDto
            {
                AgentId = group.Key.UserId,
                AgentName = group.Key.UserName,

                ResolvedTickets = group
                    .Select(x => x.TicketId)
                    .Distinct()
                    .Count(),

                AverageResolutionHours = group
                    .Average(x =>
                        (x.ResolvedAt - x.TicketCreatedAt).TotalHours)
            })
            .OrderByDescending(x => x.ResolvedTickets)
            .ToList();

        return new DashboardSummaryDto
        {
            TotalTickets = ticketStats?.TotalTickets ?? 0,
            OpenTickets = ticketStats?.OpenTickets ?? 0,
            InProgressTickets = ticketStats?.InProgressTickets ?? 0,
            ResolvedTickets = ticketStats?.ResolvedTickets ?? 0,
            ClosedTickets = ticketStats?.ClosedTickets ?? 0,

            LowPriorityTickets = ticketStats?.LowPriorityTickets ?? 0,
            MediumPriorityTickets = ticketStats?.MediumPriorityTickets ?? 0,
            HighPriorityTickets = ticketStats?.HighPriorityTickets ?? 0,
            CriticalPriorityTickets = ticketStats?.CriticalPriorityTickets ?? 0,

            UnassignedTickets = ticketStats?.UnassignedTickets ?? 0,

            TicketsByCategory = ticketsByCategory,
            TicketsByAgent = ticketsByAgent,

            TicketsLast7Days = ticketsLast7Days,
            TicketsByDay = ticketsByDay,

            AverageResolutionHours = averageResolutionHours,

            AgentPerformance = agentPerformance
        };
    }
}