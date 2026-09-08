using Microsoft.AspNetCore.Identity;

namespace SupportDesk.API.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = "User"; 

    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Ticket> AssignedTickets { get; set; }
    = new List<Ticket>();

    public bool IsActive { get; set; } = true;

    public int TokenVersion { get; set; } = 1;
}
