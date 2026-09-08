using Microsoft.EntityFrameworkCore;
using SupportDesk.API.Constants;
using SupportDesk.API.Data;
using SupportDesk.API.DTOs;
using SupportDesk.API.Models;

namespace SupportDesk.API.Services;

public class TicketService : ITicketService
{
    private readonly SupportDeskDbContext _context;

    public TicketService(SupportDeskDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResultDto<TicketResponseDto>> GetAllAsync(
        TicketQueryParameters parameters,
        int userId,
        string role)
    {
        var query = _context.Tickets
            .Include(t => t.User)
            .Include(t => t.Category)
            .Include(t => t.AssignedToUser)
            .AsQueryable();

        query = ApplyAccessFilter(
            query,
            userId,
            role
        );

        // Filtro por búsqueda
        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            query = query.Where(
                t => t.Title.Contains(parameters.Search) ||
                     t.Description.Contains(parameters.Search)
            );
        }

        // Filtro por estado
        if (!string.IsNullOrEmpty(parameters.Status))
        {
            query = query.Where(
                t => t.Status == parameters.Status
            );
        }

        // Filtro por prioridad
        if (!string.IsNullOrEmpty(parameters.Priority))
        {
            query = query.Where(
                t => t.Priority == parameters.Priority
            );
        }

        // Filtro por categoría
        if (parameters.CategoryId.HasValue)
        {
            query = query.Where(
                t => t.CategoryId ==
                     parameters.CategoryId.Value
            );
        }

        // Total de registros antes de paginar
        var totalCount =
            await query.CountAsync();

        // Ordenamiento
        query = parameters.SortBy.ToLower() switch
        {
            "title" =>
                parameters.Descending
                    ? query.OrderByDescending(
                        t => t.Title)
                    : query.OrderBy(
                        t => t.Title),

            "priority" =>
                parameters.Descending
                    ? query.OrderByDescending(
                        t => t.Priority)
                    : query.OrderBy(
                        t => t.Priority),

            "status" =>
                parameters.Descending
                    ? query.OrderByDescending(
                        t => t.Status)
                    : query.OrderBy(
                        t => t.Status),

            "createdat" =>
                parameters.Descending
                    ? query.OrderByDescending(
                        t => t.CreatedAt)
                    : query.OrderBy(
                        t => t.CreatedAt),

            _ =>
                parameters.Descending
                    ? query.OrderByDescending(
                        t => t.Id)
                    : query.OrderBy(
                        t => t.Id)
        };

        // Paginación
        var ticketEntities = await query
            .AsNoTracking()
            .Skip(
                (parameters.Page - 1) *
                parameters.PageSize
            )
            .Take(parameters.PageSize)
            .ToListAsync();

        // Un único mapeo Ticket -> TicketResponseDto
        var tickets = ticketEntities
            .Select(MapToTicketResponse)
            .ToList();

        var totalPages =
            (int)Math.Ceiling(
                totalCount /
                (double)parameters.PageSize
            );

        return new PagedResultDto<TicketResponseDto>
        {
            Page = parameters.Page,
            PageSize = parameters.PageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            Items = tickets
        };
    }

    public async Task<TicketResponseDto?> GetByIdAsync(
        int id,
        int userId,
        string role)
    {
        var query = _context.Tickets
            .Include(t => t.User)
            .Include(t => t.Category)
            .Include(t => t.AssignedToUser)
            .AsNoTracking()
            .AsQueryable();

        query = ApplyAccessFilter(
            query,
            userId,
            role
        );

        var ticket = await query
            .FirstOrDefaultAsync(
                t => t.Id == id
            );

        if (ticket == null)
        {
            return null;
        }

        return MapToTicketResponse(ticket);
    }

    public async Task<TicketDetailResponseDto?> GetDetailByIdAsync(
        int id,
        int userId,
        string role)
    {
        var query = _context.Tickets
            .Include(t => t.User)
            .Include(t => t.Category)
            .Include(t => t.Comments)
                .ThenInclude(c => c.User)
            .Include(t => t.AssignedToUser)
            .AsQueryable();

        query = ApplyAccessFilter(
            query,
            userId,
            role
        );

        var ticket = await query
            .FirstOrDefaultAsync(
                t => t.Id == id
            );

        if (ticket == null)
        {
            return null;
        }

        return new TicketDetailResponseDto
        {
            Id = ticket.Id,
            Title = ticket.Title,
            Description = ticket.Description,
            Status = ticket.Status,
            Priority = ticket.Priority,
            CreatedAt = ticket.CreatedAt,

            User = MapToUserResponse(
                ticket.User
            ),

            Category = MapToCategoryResponse(
                ticket.Category
            ),

            AssignedToUser = MapToUserResponse(
                ticket.AssignedToUser
            ),

            Comments = ticket.Comments
                .Select(comment =>
                    new CommentDetailResponseDto
                    {
                        Id = comment.Id,
                        Content = comment.Content,
                        CreatedAt = comment.CreatedAt,
                        User = MapToUserResponse(
                            comment.User
                        )
                    }
                )
                .ToList()
        };
    }

    public async Task<TicketResponseDto> CreateAsync(
        CreateTicketDto dto,
        int userId)
    {
        var userExists = await _context.Users
            .AnyAsync(
                u => u.Id == userId
            );

        if (!userExists)
        {
            throw new KeyNotFoundException(
                $"User with ID {userId} does not exist."
            );
        }

        var categoryExists =
            await _context.Categories
                .AnyAsync(
                    c => c.Id == dto.CategoryId
                );

        if (!categoryExists)
        {
            throw new KeyNotFoundException(
                $"Category with ID {dto.CategoryId} does not exist."
            );
        }

        if (!IsValidPriority(dto.Priority))
        {
            throw new ArgumentException(
                "Invalid priority. Allowed values: Low, Medium, High, Critical."
            );
        }

        await using var transaction =
            await _context.Database
                .BeginTransactionAsync();

        try
        {
            var ticket = new Ticket
            {
                Title = dto.Title,
                Description = dto.Description,
                Priority = dto.Priority,
                Status = TicketStatuses.Open,
                CreatedAt = DateTime.UtcNow,
                userId = userId,
                CategoryId = dto.CategoryId
            };

            _context.Tickets.Add(ticket);

            // Primer SaveChanges para obtener Ticket.Id
            await _context.SaveChangesAsync();

            AddHistory(
                ticket.Id,
                userId,
                TicketHistoryActions.Created,
                newValue: TicketStatuses.Open
            );

            // Segundo SaveChanges para guardar el historial
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            // Cargamos las relaciones para devolver
            // el mismo TicketResponseDto completo.
            await _context.Entry(ticket)
                .Reference(t => t.User)
                .LoadAsync();

            await _context.Entry(ticket)
                .Reference(t => t.Category)
                .LoadAsync();

            return MapToTicketResponse(ticket);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<TicketResponseDto?> UpdateAsync(
        int id,
        UpdateTicketDto dto,
        int userId,
        string role)
    {
        var query = _context.Tickets
            .AsQueryable();

        query = ApplyAccessFilter(
            query,
            userId,
            role
        );

        var ticket = await query
            .Include(t => t.User)
            .Include(t => t.Category)
            .Include(t => t.AssignedToUser)
            .FirstOrDefaultAsync(
                t => t.Id == id
            );

        if (ticket == null)
        {
            return null;
        }

        // Validar prioridad
        if (!IsValidPriority(dto.Priority))
        {
            throw new ArgumentException(
                "Invalid priority. Allowed values: Low, Medium, High, Critical."
            );
        }

        var categoryExists =
    await _context.Categories
        .AnyAsync(
            c => c.Id == dto.CategoryId
        );

        if (!categoryExists)
        {
            throw new KeyNotFoundException(
                $"Category with ID {dto.CategoryId} does not exist."
            );
        }

        // Guardar valores anteriores ANTES de modificar.
        var oldTitle =
            ticket.Title;

        var oldDescription =
            ticket.Description;

        var oldPriority =
            ticket.Priority;

        var oldCategoryId =
           ticket.CategoryId;

        var oldCategoryName =
            ticket.Category?.Name;

        // Actualizar ticket.
        ticket.Title =
            dto.Title;

        ticket.Description =
            dto.Description;

        ticket.Priority =
            dto.Priority;

        ticket.CategoryId =
            dto.CategoryId;

        // Historial: título.
        if (oldTitle != dto.Title)
        {
            AddHistory(
                ticket.Id,
                userId,
                TicketHistoryActions.Updated,
                TicketHistoryFields.Title,
                oldTitle,
                dto.Title
            );
        }

        // Historial: descripción.
        if (oldDescription != dto.Description)
        {
            AddHistory(
                ticket.Id,
                userId,
                TicketHistoryActions.Updated,
                TicketHistoryFields.Description,
                oldDescription,
                dto.Description
            );
        }

        // Historial: prioridad.
        if (oldPriority != dto.Priority)
        {
            AddHistory(
                ticket.Id,
                userId,
                TicketHistoryActions.Updated,
                TicketHistoryFields.Priority,
                oldPriority,
                dto.Priority
            );
        }

        if (oldCategoryId != dto.CategoryId)
        {
            var newCategory =
                await _context.Categories
                    .FirstAsync(
                        c => c.Id == dto.CategoryId
                    );

            AddHistory(
                ticket.Id,
                userId,
                TicketHistoryActions.Updated,
                TicketHistoryFields.Category,
                oldCategoryName ??
                    oldCategoryId.ToString(),
                newCategory.Name
            );

            ticket.Category =
                newCategory;
        }

        // Un solo SaveChangesAsync.
        await _context.SaveChangesAsync();

        return MapToTicketResponse(ticket);
    }

    public async Task<bool> DeleteAsync(
        int id,
        int userId,
        string role)
    {
        var query = _context.Tickets
            .AsQueryable();

        // Mantenemos el mismo criterio de acceso
        // utilizado en las demás operaciones.
        query = ApplyAccessFilter(
            query,
            userId,
            role
        );

        var ticket = await query
            .FirstOrDefaultAsync(
                t => t.Id == id
            );

        if (ticket == null)
        {
            return false;
        }

        if (ticket.Status ==
            TicketStatuses.Closed)
        {
            throw new ArgumentException(
                "A closed ticket cannot be deleted."
            );
        }

        ticket.IsDeleted = true;

        AddHistory(
            ticket.Id,
            userId,
            TicketHistoryActions.Deleted,
            TicketHistoryFields.IsDeleted,
            "false",
            "true"
        );

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<TicketResponseDto?> UpdateStatusAsync(
        int id,
        UpdateTicketStatusDto dto,
        int userId,
        string role)
    {
        var validStatuses = new[]
        {
            TicketStatuses.Open,
            TicketStatuses.InProgress,
            TicketStatuses.Resolved,
            TicketStatuses.Closed
        };

        if (!validStatuses.Contains(dto.Status))
        {
            throw new ArgumentException(
                $"Invalid status. Allowed values: {string.Join(", ", validStatuses)}"
            );
        }

        var query = _context.Tickets
            .AsQueryable();

        query = ApplyAccessFilter(
            query,
            userId,
            role
        );

        var ticket = await query
            .Include(t => t.User)
            .Include(t => t.Category)
            .Include(t => t.AssignedToUser)
            .FirstOrDefaultAsync(
                t => t.Id == id
            );

        if (ticket == null)
        {
            return null;
        }

        var isValidTransition =
            ticket.Status switch
            {
                TicketStatuses.Open =>
                    dto.Status ==
                    TicketStatuses.InProgress,

                TicketStatuses.InProgress =>
                    dto.Status ==
                    TicketStatuses.Resolved,

                TicketStatuses.Resolved =>
                    dto.Status ==
                        TicketStatuses.Closed ||
                    dto.Status ==
                        TicketStatuses.InProgress,

                TicketStatuses.Closed =>
                    false,

                _ =>
                    false
            };

        if (!isValidTransition)
        {
            throw new ArgumentException(
                $"Cannot change ticket status from '{ticket.Status}' to '{dto.Status}'."
            );
        }

        var oldStatus =
            ticket.Status;

        ticket.Status =
            dto.Status;

        if (dto.Status ==
            TicketStatuses.Resolved)
        {
            ticket.ResolvedAt =
                DateTime.UtcNow;
        }
        else if (
            oldStatus ==
                TicketStatuses.Resolved &&
            dto.Status ==
                TicketStatuses.InProgress)
        {
            ticket.ResolvedAt =
                null;
        }

        AddHistory(
            ticket.Id,
            userId,
            TicketHistoryActions.StatusChanged,
            TicketHistoryFields.Status,
            oldStatus,
            dto.Status
        );

        await _context.SaveChangesAsync();

        return MapToTicketResponse(ticket);
    }

    public async Task<TicketResponseDto?> AssignAsync(
        int id,
        AssignTicketDto dto,
        int userId)
    {
        var ticket = await _context.Tickets
            .Include(t => t.User)
            .Include(t => t.Category)
            .Include(t => t.AssignedToUser)
            .FirstOrDefaultAsync(
                t => t.Id == id
            );

        if (ticket == null)
        {
            return null;
        }

        if (ticket.Status ==
            TicketStatuses.Closed)
        {
            throw new ArgumentException(
                "A closed ticket cannot be assigned."
            );
        }

        var agent = await _context.Users
            .FirstOrDefaultAsync(
                u => u.Id == dto.AgentId
            );

        if (agent == null)
        {
            throw new KeyNotFoundException(
                $"User with ID {dto.AgentId} does not exist."
            );
        }

        if (agent.Role != UserRoles.Agent)
        {
            throw new ArgumentException(
                $"User with ID {dto.AgentId} is not an Agent."
            );
        }

        if (!agent.IsActive)
        {
            throw new ArgumentException(
                "The selected agent is inactive."
            );
        }

        var oldAgentId =
            ticket.AssignedToUserId;

        var oldAgentName =
            ticket.AssignedToUser?.Name;

        var oldStatus =
            ticket.Status;

        ticket.AssignedToUserId =
            agent.Id;

        // Actualizamos también la navegación en memoria.
        // Así MapToTicketResponse devuelve inmediatamente
        // el nuevo agente, no el anterior.
        ticket.AssignedToUser =
            agent;

        // Al asignar un ticket abierto,
        // pasa automáticamente a In Progress.
        if (ticket.Status ==
            TicketStatuses.Open)
        {
            ticket.Status =
                TicketStatuses.InProgress;
        }

        AddHistory(
            ticket.Id,
            userId,
            oldAgentId == null
                ? TicketHistoryActions.Assigned
                : TicketHistoryActions.Reassigned,
            TicketHistoryFields.AssignedTo,
            oldAgentId == null
                ? null
                : $"{oldAgentId} - {oldAgentName}",
            $"{agent.Id} - {agent.Name}"
        );

        // Si la asignación cambió el estado,
        // también se registra en el historial.
        if (oldStatus != ticket.Status)
        {
            AddHistory(
                ticket.Id,
                userId,
                TicketHistoryActions.StatusChanged,
                TicketHistoryFields.Status,
                oldStatus,
                ticket.Status
            );
        }

        await _context.SaveChangesAsync();

        return MapToTicketResponse(ticket);
    }

    public async Task<TicketResponseDto?> UnassignAsync(
        int id,
        int userId)
    {
        var ticket = await _context.Tickets
            .Include(t => t.User)
            .Include(t => t.Category)
            .Include(t => t.AssignedToUser)
            .FirstOrDefaultAsync(
                t => t.Id == id
            );

        if (ticket == null)
        {
            return null;
        }

        if (ticket.Status ==
            TicketStatuses.Closed)
        {
            throw new ArgumentException(
                "A closed ticket cannot be unassigned."
            );
        }

        if (ticket.AssignedToUserId == null)
        {
            throw new ArgumentException(
                "The ticket is not assigned to an agent."
            );
        }

        var oldAgentId =
            ticket.AssignedToUserId;

        var oldAgent =
            ticket.AssignedToUser;

        ticket.AssignedToUserId =
            null;

        // La navegación también debe quedar en null
        // antes de construir la respuesta.
        ticket.AssignedToUser =
            null;

        AddHistory(
            ticket.Id,
            userId,
            TicketHistoryActions.Unassigned,
            TicketHistoryFields.AssignedTo,
            oldAgent == null
                ? oldAgentId.ToString()
                : $"{oldAgent.Id} - {oldAgent.Name}",
            null
        );

        await _context.SaveChangesAsync();

        return MapToTicketResponse(ticket);
    }

    public async Task<List<TicketResponseDto>>
        GetDeletedAsync()
    {
        var tickets = await _context.Tickets
            .IgnoreQueryFilters()
            .Where(t => t.IsDeleted)
            .Include(t => t.User)
            .Include(t => t.Category)
            .Include(t => t.AssignedToUser)
            .AsNoTracking()
            .ToListAsync();

        return tickets
            .Select(MapToTicketResponse)
            .ToList();
    }

    public async Task<TicketResponseDto?> RestoreAsync(
        int id,
        int userId)
    {
        var ticket = await _context.Tickets
            .IgnoreQueryFilters()
            .Include(t => t.User)
            .Include(t => t.Category)
            .Include(t => t.AssignedToUser)
            .FirstOrDefaultAsync(
                t => t.Id == id &&
                     t.IsDeleted
            );

        if (ticket == null)
        {
            return null;
        }

        ticket.IsDeleted =
            false;

        AddHistory(
            ticket.Id,
            userId,
            TicketHistoryActions.Restored,
            TicketHistoryFields.IsDeleted,
            "true",
            "false"
        );

        await _context.SaveChangesAsync();

        return MapToTicketResponse(ticket);
    }

    private IQueryable<Ticket> ApplyAccessFilter(
        IQueryable<Ticket> query,
        int userId,
        string role)
    {
        if (role == UserRoles.User)
        {
            return query.Where(
                t => t.userId == userId
            );
        }

        if (role == UserRoles.Agent)
        {
            return query.Where(
                t => t.AssignedToUserId ==
                     userId
            );
        }

        return query;
    }

    private static bool IsValidPriority(
        string priority)
    {
        return
            priority == TicketPriorities.Low ||
            priority == TicketPriorities.Medium ||
            priority == TicketPriorities.High ||
            priority == TicketPriorities.Critical;
    }

    public async Task<PagedResultDto<TicketHistoryResponseDto>>
        GetHistoryAsync(
            int ticketId,
            int userId,
            string role,
            TicketHistoryQueryParameters parameters)
    {
        IQueryable<Ticket> ticketQuery;

        if (role == UserRoles.Admin)
        {
            ticketQuery = _context.Tickets
                .IgnoreQueryFilters();
        }
        else
        {
            ticketQuery =
                _context.Tickets.AsQueryable();

            ticketQuery = ApplyAccessFilter(
                ticketQuery,
                userId,
                role
            );
        }

        var ticketExists =
            await ticketQuery.AnyAsync(
                t => t.Id == ticketId
            );

        if (!ticketExists)
        {
            throw new KeyNotFoundException(
                "Ticket not found."
            );
        }

        var historyQuery =
            role == UserRoles.Admin
                ? _context.TicketHistories
                    .IgnoreQueryFilters()
                    .Where(
                        h => h.TicketId ==
                             ticketId
                    )
                : _context.TicketHistories
                    .Where(
                        h => h.TicketId ==
                             ticketId
                    );

        var totalCount =
            await historyQuery.CountAsync();

        var history = await historyQuery
            .OrderByDescending(
                h => h.CreatedAt
            )
            .Skip(
                (parameters.Page - 1) *
                parameters.PageSize
            )
            .Take(parameters.PageSize)
            .Select(h =>
                new TicketHistoryResponseDto
                {
                    Id = h.Id,
                    TicketId = h.TicketId,
                    UserId = h.UserId,
                    Action = h.Action,
                    FieldName = h.FieldName,
                    OldValue = h.OldValue,
                    NewValue = h.NewValue,
                    CreatedAt = h.CreatedAt,

                    User = h.User == null
                        ? null
                        : new UserResponseDto
                        {
                            Id = h.User.Id,
                            Name = h.User.Name,
                            Email = h.User.Email,
                            Role = h.User.Role,
                            IsActive =
                                h.User.IsActive
                        }
                }
            )
            .ToListAsync();

        var totalPages =
            (int)Math.Ceiling(
                totalCount /
                (double)parameters.PageSize
            );

        return new PagedResultDto<TicketHistoryResponseDto>
        {
            Page = parameters.Page,
            PageSize = parameters.PageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            Items = history
        };
    }

    private void AddHistory(
        int ticketId,
        int userId,
        string action,
        string? fieldName = null,
        string? oldValue = null,
        string? newValue = null)
    {
        var history = new TicketHistory
        {
            TicketId = ticketId,
            UserId = userId,
            Action = action,
            FieldName = fieldName,
            OldValue = oldValue,
            NewValue = newValue,
            CreatedAt = DateTime.UtcNow
        };

        _context.TicketHistories.Add(history);
    }

    private static TicketResponseDto MapToTicketResponse(
        Ticket ticket)
    {
        return new TicketResponseDto
        {
            Id = ticket.Id,
            Title = ticket.Title,
            Description = ticket.Description,
            Status = ticket.Status,
            Priority = ticket.Priority,
            CreatedAt = ticket.CreatedAt,

            // Estos IDs ya existen en tu DTO,
            // por lo que también los mantenemos.
            UserId = ticket.userId,
            CategoryId = ticket.CategoryId,

            User = MapToUserResponse(
                ticket.User
            ),

            Category = MapToCategoryResponse(
                ticket.Category
            ),

            AssignedToUser =
                MapToUserResponse(
                    ticket.AssignedToUser
                )
        };
    }

    private static UserResponseDto? MapToUserResponse(
        User? user)
    {
        if (user == null)
        {
            return null;
        }

        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive
        };
    }

    private static CategoryResponseDto?
        MapToCategoryResponse(
            Category? category)
    {
        if (category == null)
        {
            return null;
        }

        return new CategoryResponseDto
        {
            Id = category.Id,
            Name = category.Name,
            Description =
                category.Description
        };
    }
}
