using System.ComponentModel.DataAnnotations;

namespace SupportDesk.API.DTOs;


public class TicketQueryParameters
{
    public string? Search { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public string SortBy { get; set; } = "Id";
    public bool Descending { get; set; } = false;

    [Range(1, int.MaxValue)]
    public int Page { get; set; } = 1;

    [Range(1, 100)]
    public int PageSize { get; set; } = 10;

    public int? CategoryId { get; set; }


}
