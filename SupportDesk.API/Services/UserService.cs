using Microsoft.EntityFrameworkCore;
using SupportDesk.API.Constants;
using SupportDesk.API.Data;
using SupportDesk.API.DTOs;
using SupportDesk.API.Models;

namespace SupportDesk.API.Services;

public class UserService : IUserService
{
    private readonly SupportDeskDbContext _context;
    public UserService(SupportDeskDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserResponseDto>> GetAllAsync()
    {
        return await _context.Users.
            Select(user => new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive
            }).ToListAsync();
    }

    public async Task<UserResponseDto?> GetByIdAsync(int id) 
    {
        return await _context.Users
               .Where(user => user.Id == id)
               .Select(user => new UserResponseDto
               {
                   Id = user.Id,
                   Name = user.Name,
                   Email = user.Email,
                   Role = user.Role,
                   IsActive = user.IsActive
               }).FirstOrDefaultAsync();
    }

    public async Task<UserResponseDto?> UpdateAsync(int id, UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null )
        {
            return null;
        }

        user.Name = dto.Name;
        user.Email = dto.Email;

        await _context.SaveChangesAsync();

        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return false;
        }

        var hasTickets = await _context.Tickets
            .AnyAsync(t => t.userId == id);

        var hasComments = await _context.Comments
            .AnyAsync(c => c.UserId == id);

        var hasAssignedTickets = await _context.Tickets
            .AnyAsync(t => t.AssignedToUserId == id);

        var hasTicketHistory = await _context.TicketHistories
            .AnyAsync(h => h.UserId == id);

        if (
            hasTickets ||
            hasComments ||
            hasAssignedTickets ||
            hasTicketHistory)
        {
            throw new ArgumentException(
                "The user cannot be deleted because they have related system activity."
            );
        }

        _context.Users.Remove(user);

        await _context.SaveChangesAsync();

        return true;
    }


    public async Task<UserResponseDto?> UpdateRoleAsync(
    int id,
    UpdateUserRoleDto dto)
    {
        var validRoles = new[]
        {
        UserRoles.User,
        UserRoles.Agent,
        UserRoles.Admin
    };

        if (!validRoles.Contains(dto.Role))
        {
            throw new ArgumentException(
                $"Invalid role. Allowed values: {string.Join(", ", validRoles)}"
            );
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return null;
        }

        if (user.Role == UserRoles.Admin && dto.Role != UserRoles.Admin 
            && user.IsActive)
        {
            var activeAdminCount = await _context.Users.CountAsync(u => u.Role == UserRoles.Admin
            && u.IsActive);

            if (activeAdminCount <= 1)
            {
                throw new ArgumentException("The last active Admin cannot lose the Admin role.");
            }
        }

        if (user.Role == UserRoles.Agent &&
    dto.Role != UserRoles.Agent)
        {
            var hasAssignedTickets = await _context.Tickets
                .AnyAsync(t => t.AssignedToUserId == user.Id
                && t.Status != TicketStatuses.Closed);

            if (hasAssignedTickets)
            {
                throw new ArgumentException(
                    "The Agent cannot change roles while they have assigned tickets."
                );
            }
        }
        if (user.Role != dto.Role)
        {
            user.TokenVersion++;
        }

        user.Role = dto.Role;

        await _context.SaveChangesAsync();

        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
             Role = user.Role,
            IsActive = user.IsActive
        };
    }


    public async Task<UserResponseDto?> UpdateStatusAsync(
    int id,
    UpdateUserStatusDto dto, int currenUserId)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return null;
        }

        if (user.Id == currenUserId && !dto.IsActive)
        {
            throw new ArgumentException("You cannot deactivate your own account.");
        }

        if (!dto.IsActive &&
    user.IsActive &&
    user.Role == UserRoles.Agent)
        {
            var hasActiveAssignedTickets = await _context.Tickets
                .AnyAsync(t =>
                    t.AssignedToUserId == user.Id &&
                    t.Status != TicketStatuses.Closed);

            if (hasActiveAssignedTickets)
            {
                throw new ArgumentException(
                    "The Agent cannot be deactivated while they have active assigned tickets."
                );
            }
        }

        if (!dto.IsActive && user.IsActive)
        {
            user.TokenVersion++;
        }

        user.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
             Role = user.Role,
            IsActive = user.IsActive
        };
    }

}
