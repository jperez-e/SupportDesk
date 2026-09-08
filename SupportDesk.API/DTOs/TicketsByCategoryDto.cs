namespace SupportDesk.API.DTOs;

public class TicketsByCategoryDto
{
    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public int TicketCount { get; set; }

}
