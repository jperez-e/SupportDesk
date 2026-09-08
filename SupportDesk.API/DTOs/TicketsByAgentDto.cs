namespace SupportDesk.API.DTOs;

public class TicketsByAgentDto
{
    public int AgentId { get; set; }

    public string AgentName { get; set; } = string.Empty;

    public int TicketCount { get; set; }

}
