namespace SupportDesk.API.DTOs;

public class AgentPerformanceDto
{
    public int AgentId { get; set; }

    public string AgentName { get; set; } = string.Empty;

    public int ResolvedTickets { get; set; }

    public double AverageResolutionHours { get; set; }
}
