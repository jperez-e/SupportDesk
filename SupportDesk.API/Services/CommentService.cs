using Microsoft.EntityFrameworkCore;
using SupportDesk.API.Constants;
using SupportDesk.API.Data;
using SupportDesk.API.DTOs;
using SupportDesk.API.Models;
using System.Data;

namespace SupportDesk.API.Services;

public class CommentService : ICommentService
{
    private readonly SupportDeskDbContext _context;

    public CommentService(SupportDeskDbContext context)
    {
        _context = context;
    }


    public async Task<List<CommentResponseDto>> GetByTicketIdAsync(int ticketId, int userId, string role)
    {
        var ticketQuery = _context.Tickets.AsQueryable();

        if (role == UserRoles.User)
        {
            ticketQuery = ticketQuery.Where(
                t => t.userId == userId
            );
        }
        else if (role == UserRoles.Agent)
        {
            ticketQuery = ticketQuery.Where(
                t => t.AssignedToUserId == userId
            );
        }

        var ticketExists = await ticketQuery
            .AnyAsync(t => t.Id == ticketId);

        if (!ticketExists)
        {
            throw new KeyNotFoundException(
                $"Ticket with ID {ticketId} does not exist or you do not have access to it."
            );
        }

        return await _context.Comments
            .Where(c => c.TicketId == ticketId)
            .Select(c => new CommentResponseDto
            {
                Id = c.Id,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                TicketId = c.TicketId,
                UserId = c.UserId
            })
            .ToListAsync();
    }

    public async Task<CommentResponseDto?> GetByIdAsync(int id, int userId, string role)
    {
        var query = _context.Comments
       .Include(c => c.Ticket)
       .AsQueryable();

        if (role == UserRoles.User)
        {
            query = query.Where(
                c => c.Ticket != null &&
                     c.Ticket.userId == userId
            );
        }
        else if (role == UserRoles.Agent)
        {
            query = query.Where(
                c => c.Ticket != null &&
                     c.Ticket.AssignedToUserId == userId
            );
        }


        return await query
            .Where(c => c.Id == id)
            .Select(c => new CommentResponseDto
            {
                Id = c.Id,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                TicketId = c.TicketId,
                UserId = c.UserId
            })
            .FirstOrDefaultAsync();
    }

    public async Task<CommentResponseDto>
       CreateAsync(CreateCommentDto dto, int userId,
    string role)
    {
        var query = _context.Tickets.AsQueryable();

        if (role == UserRoles.User)
        {
            query = query.Where(t => t.userId == userId);
        }
        else if (role == UserRoles.Agent)
        {
            query = query.Where(t => t.AssignedToUserId == userId);
        }

        var ticket = await query
            .FirstOrDefaultAsync(t => t.Id == dto.TicketId);

        if (ticket == null)
        {
            throw new KeyNotFoundException(
                $"Ticket with ID {dto.TicketId} does not exist or you do not have access to it.");
        }

        var comment = new Comment
        {
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow,
            TicketId = dto.TicketId,
            UserId = userId
        };

        _context.Comments.Add(comment);

        await _context.SaveChangesAsync();

        return new CommentResponseDto
        {
            Id = comment.Id,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            TicketId = comment.TicketId,
            UserId = comment.UserId
        };
    }
    public async Task<bool> DeleteAsync(int id, int userId, string role)
    {
        var query = _context.Comments.AsQueryable();

        if (role != UserRoles.Admin)
        {
            query = query.Where(c => c.UserId == userId);
        }

        var comment = await _context.Comments.FindAsync(id);

        if (comment == null)
        {
            return false;
        }

        _context.Comments.Remove(comment);

        await _context.SaveChangesAsync();

        return true;
    }

}
