using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using SupportDesk.API.Data;
using SupportDesk.API.Models;
using Microsoft.EntityFrameworkCore;
using SupportDesk.API.DTOs;
using SupportDesk.API.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Reflection.Metadata.Ecma335;
using SupportDesk.API.Constants;

namespace SupportDesk.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketservice)
    {
        _ticketService = ticketservice;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetTickets(
        [FromQuery] TicketQueryParameters parameters
        )
    {
        var userId = GetCurrentUserId();
        var role = GetCurrentUserRole();

        if (userId == null || string.IsNullOrEmpty(role))
        {
            return Unauthorized();
        }

        var result = await _ticketService.GetAllAsync(parameters, userId.Value, role);

        return Ok(result);
    }

[Authorize]
[HttpGet("{id}")]
    public async Task<IActionResult> GetTicketsById(int id)
    {
        var userId = GetCurrentUserId();
        var role = GetCurrentUserRole();

        if (userId == null || string.IsNullOrEmpty(role))
        {
            return Unauthorized();
        }

        var ticket = await _ticketService.GetByIdAsync(
            id,
            userId.Value,
            role);

        if (ticket == null)
        {
            return NotFound();
        }

        return Ok(ticket);
    }

    [Authorize]
    [HttpGet("{id}/details")]
    public async Task<IActionResult> GetTicketDetails(int id)
    {
        var userId = GetCurrentUserId();
        var role = GetCurrentUserRole();

        if (userId == null || string.IsNullOrEmpty(role))
        {
            return Unauthorized();
        }

        var ticket = await _ticketService.GetDetailByIdAsync(
            id,
            userId.Value,
            role);

        if (ticket == null)
        {
            return NotFound();
        }

        return Ok(ticket);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateTicket(CreateTicketDto dto)
    {

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        {
            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdClaim.Value);
           
            try
            {
                var result = await _ticketService.CreateAsync(dto, userId);

                return CreatedAtAction(nameof(GetTicketsById), new { id = result.Id }, result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
        }
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTicket(int id, UpdateTicketDto dto)
    {
        var userId = GetCurrentUserId();
        var role = GetCurrentUserRole();

        if (userId == null || string.IsNullOrEmpty(role))
        {
            return Unauthorized();
        }

        var ticket = await _ticketService.UpdateAsync(
            id,
            dto,
            userId.Value,
            role);

        if (ticket == null)
        {
            return NotFound();
        }

        return Ok(ticket);
    }

    [Authorize(Roles = $"{UserRoles.User}, {UserRoles.Admin}")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTicket(int id)
    {
        var userId = GetCurrentUserId();
        var role = GetCurrentUserRole();

        if (userId == null || string.IsNullOrEmpty(role))
        {
            return Unauthorized();
        }

        var deleted = await _ticketService.DeleteAsync(
            id,
            userId.Value,
            role);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    [Authorize(Roles = $"{UserRoles.Agent}, {UserRoles.Admin}")]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateTicketStatusDto dto)
    {

        var userId = GetCurrentUserId();
        var role = GetCurrentUserRole();

        if (userId == null || string.IsNullOrWhiteSpace(role))
        {
            return Unauthorized();
        }

        var ticket = await _ticketService.UpdateStatusAsync(
            id, dto, userId.Value, role);

        if (ticket == null)
        {
            return NotFound();
        }

        return Ok(ticket);
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpPatch("{id}/assign")]
    public async Task<IActionResult> Assign(
    int id,
    AssignTicketDto dto)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var ticket = await _ticketService.AssignAsync(
            id,
            dto, userId.Value);

        if (ticket == null)
        {
            return NotFound();
        }

        return Ok(ticket);
    }


    [Authorize(Roles = UserRoles.Admin)]
    [HttpPatch("{id}/unassign")]
    public async Task<IActionResult> Unassign(int id)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var ticket = await _ticketService.UnassignAsync(id, userId.Value);

        if (ticket == null)
        {
            return NotFound();
        }
        return Ok(ticket);
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (int.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }

        return null;
    }

    private string? GetCurrentUserRole()
    {
        return User.FindFirst(ClaimTypes.Role)?.Value;
    }


    [Authorize(Roles = UserRoles.Admin)]
    [HttpGet("deleted")]
    public async Task<IActionResult> GetDeletedTickets()
    {
        var tickets = await _ticketService.GetDeletedAsync();
        return Ok(tickets);
    }

[Authorize(Roles = UserRoles.Admin)]
[HttpPatch("{id}/restore")]
public async Task<IActionResult> RestoreTicket(int id)
{
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var ticket = await _ticketService.RestoreAsync(id, userId.Value);

    if (ticket == null)
    {
        return NotFound();
    }

    return Ok(ticket);
    }

    [Authorize]
    [HttpGet("{id}/history")]
    public async Task<IActionResult> GetHistory(
    int id,
    [FromQuery] TicketHistoryQueryParameters parameters)
    {
        var userId = GetCurrentUserId();
        var role = GetCurrentUserRole();

        if (userId == null || string.IsNullOrEmpty(role))
        {
            return Unauthorized();
        }

        var history = await _ticketService.GetHistoryAsync(
            id,
            userId.Value,
            role,
            parameters);

        return Ok(history);
    }


}