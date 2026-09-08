using Microsoft.EntityFrameworkCore;
using SupportDesk.API.Models;

namespace SupportDesk.API.Data;

    public class SupportDeskDbContext : DbContext
    {
    public SupportDeskDbContext(DbContextOptions<SupportDeskDbContext> options)
        : base(options)
{ 
}
public DbSet<Ticket> Tickets { get; set; }
public DbSet<User> Users { get; set; }
public DbSet<Category> Categories { get; set; }
public DbSet<Comment> Comments { get; set; }
public DbSet<TicketHistory> TicketHistories { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Ticket>()
        .HasOne(t => t.User)
        .WithMany(u => u.Tickets)
        .HasForeignKey(t => t.userId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Ticket>()
       .HasOne(t => t.AssignedToUser)
       .WithMany(u => u.AssignedTickets)
       .HasForeignKey(t => t.AssignedToUserId)
       .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Ticket>()
        .HasOne(t => t.Category)
        .WithMany(c => c.Tickets)
        .HasForeignKey(t => t.CategoryId)
        .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<Comment>()
       .HasOne(c => c.Ticket)
       .WithMany(t => t.Comments)
       .HasForeignKey(c => c.TicketId)
       .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Comment>()
        .HasOne(c => c.User)
        .WithMany(u => u.Comments)
        .HasForeignKey(c => c.UserId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TicketHistory>()
        .HasOne(h => h.Ticket)
        .WithMany()
        .HasForeignKey(h => h.TicketId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TicketHistory>()
         .HasOne(h => h.User)
         .WithMany()
         .HasForeignKey(h => h.UserId)
         .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Comment>()
        .HasQueryFilter(c => !c.Ticket!.IsDeleted);

        modelBuilder.Entity<TicketHistory>()
        .HasQueryFilter(h => !h.Ticket!.IsDeleted);

        modelBuilder.Entity<Ticket>().HasQueryFilter(t => !t.IsDeleted);
    }
}