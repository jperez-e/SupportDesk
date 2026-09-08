using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SupportDesk.API.DTOs;
using SupportDesk.API.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace SupportDesk.API.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;

    public CommentsController(
        ICommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpGet("ticket/{ticketId}")]
    public async Task<IActionResult> GetByTicket(int ticketId)
    {
        var userIdClaim =
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var role =
            User.FindFirst(ClaimTypes.Role)?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        if (string.IsNullOrEmpty(role))
        {
            return Unauthorized();
        }

        var comments =
            await _commentService.GetByTicketIdAsync(ticketId, userId, role);

        return Ok(comments);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetComment(int id)
    {
        var userIdClaim =
      User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var role =
            User.FindFirst(ClaimTypes.Role)?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        if (string.IsNullOrEmpty(role))
        {
            return Unauthorized();
        }

        var comment =
            await _commentService.GetByIdAsync(id, userId, role);

        if (comment == null)
        {
            return NotFound();
        }

        return Ok(comment);
    }

       [HttpPost]
    public async Task<IActionResult> CreateComment(
        CreateCommentDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        if (string.IsNullOrEmpty(role))
        {
            return Unauthorized();
        }

        var comment =
            await _commentService.CreateAsync(dto, userId, role);

        return CreatedAtAction(
            nameof(GetComment),
            new { id = comment.Id },
            comment);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(int id)
    {
        var userIdClaim =
          User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var role =
            User.FindFirst(ClaimTypes.Role)?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        if (string.IsNullOrEmpty(role))
        {
            return Unauthorized();
        }

        var deleted =
            await _commentService.DeleteAsync(id, userId, role);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
