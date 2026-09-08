using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SupportDesk.API.Constants;
using SupportDesk.API.DTOs;
using SupportDesk.API.Services;
using System.Security.Claims;

namespace SupportDesk.API.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var user = await _userService.GetAllAsync();
        return Ok(user);
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _userService.GetByIdAsync(id);

        if (user == null)
        {
            return NotFound();
        }
        return Ok(user);
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id,  UpdateUserDto dto)
    {
        var user = await _userService.UpdateAsync(id, dto);

        if(user == null)
        {  return NotFound(); }

        return Ok(user);
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var deleted = await _userService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }
        return NoContent();
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpPatch("{id}/role")]
    public async Task<IActionResult> UpdateRole(int id, UpdateUserRoleDto dto)
    {
        var user = await _userService.UpdateRoleAsync(id, dto);

        if (user == null)
        {
            return NotFound();
        }
        return Ok(user);
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(
    int id,
    UpdateUserStatusDto dto)
    {

        var userIdClaim = User.FindFirst(
        ClaimTypes.NameIdentifier
    )?.Value;

        if (!int.TryParse(userIdClaim, out var currentUserId))
        {
            return Unauthorized();
        }

        var user = await _userService.UpdateStatusAsync(id, dto, currentUserId);

        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }
}
