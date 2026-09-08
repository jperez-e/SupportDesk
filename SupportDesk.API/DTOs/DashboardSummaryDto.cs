namespace SupportDesk.API.DTOs;

public class DashboardSummaryDto
{
    public int TotalTickets { get; set; }
    public int OpenTickets { get; set; }
    public int InProgressTickets { get; set; }
    public int ResolvedTickets { get; set; }
    public int ClosedTickets { get; set; }
    public int LowPriorityTickets { get; set; }
    public int MediumPriorityTickets {get; set;}
    public int HighPriorityTickets { get; set; }
    public int CriticalPriorityTickets { get; set; }
    public List<TicketsByCategoryDto> TicketsByCategory { get; set; } = new();
    public List<TicketsByAgentDto> TicketsByAgent { get; set; } = new();
    public int UnassignedTickets { get; set; }
    public int TicketsLast7Days { get; set; }
    public List<TicketsByDayDto> TicketsByDay { get; set; } = new();
    public double AverageResolutionHours { get; set; }
    public List<AgentPerformanceDto> AgentPerformance { get; set; } = new();

}
