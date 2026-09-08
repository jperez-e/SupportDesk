namespace SupportDesk.API.Models;

public class Ticket
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Open";
    public string Priority { get; set; } = "Medium";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int userId { get; set; }
    public User? User {get; set;}
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
        public ICollection<Comment> Comments { get; set; }
    = new List<Comment>();
    public int? AssignedToUserId { get; set; }

    public User? AssignedToUser { get; set; }

    public bool IsDeleted { get; set; } = false;

    public DateTime? ResolvedAt { get; set; }
}
