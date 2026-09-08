using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using SupportDesk.API.DTOs;
using SupportDesk.API.Services;

namespace SupportDesk.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(
        IAuthService authService
    )
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        RegisterDto dto
    )
    {
        try
        {
            var result =
                await _authService
                    .RegisterAsync(dto);

            return Ok(result);
        }
        catch (
            InvalidOperationException ex
        )
        {
            return Conflict(
                new
                {
                    message = ex.Message
                }
            );
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        LoginDto dto
    )
    {
        var result =
            await _authService
                .LoginAsync(dto);

        if (result == null)
        {
            return Unauthorized(
                new
                {
                    message =
                        "Invalid email or password."
                }
            );
        }

        return Ok(result);
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var userIdClaim =
            User.FindFirst(
                ClaimTypes.NameIdentifier
            )?.Value;

        var name =
            User.FindFirst(
                ClaimTypes.Name
            )?.Value;

        var email =
            User.FindFirst(
                ClaimTypes.Email
            )?.Value;

        var role =
            User.FindFirst(
                ClaimTypes.Role
            )?.Value;

        if (
            !int.TryParse(
                userIdClaim,
                out var userId
            )
        )
        {
            return Unauthorized();
        }

        return Ok(
            new
            {
                UserId = userId,
                Name = name,
                Email = email,
                Role = role
            }
        );
    }

    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(
        ChangePasswordDto dto
    )
    {
        var userIdClaim =
            User.FindFirst(
                ClaimTypes.NameIdentifier
            )?.Value;

        if (
            !int.TryParse(
                userIdClaim,
                out var userId
            )
        )
        {
            return Unauthorized();
        }

        var result =
            await _authService
                .ChangePasswordAsync(
                    userId,
                    dto
                );

        return Ok(result);
    }
}
