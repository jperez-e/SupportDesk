using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using SupportDesk.API.Constants;
using SupportDesk.API.Data;
using SupportDesk.API.DTOs;
using SupportDesk.API.Models;

namespace SupportDesk.API.Services;

public class AuthService : IAuthService
{
    private readonly SupportDeskDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly PasswordHasher<User> _passwordHasher;

    public AuthService(
        SupportDeskDbContext context,
        IConfiguration configuration
    )
    {
        _context = context;
        _configuration = configuration;
        _passwordHasher =
            new PasswordHasher<User>();
    }

    public async Task<AuthResponsedto?> RegisterAsync(
        RegisterDto dto
    )
    {
        var normalizedEmail =
            dto.Email.Trim().ToLower();

        var emailExists =
            await _context.Users.AnyAsync(
                u =>
                    u.Email.ToLower() ==
                    normalizedEmail
            );

        if (emailExists)
        {
            throw new InvalidOperationException(
                "A user with this email already exists."
            );
        }

        var user = new User
        {
            Name = dto.Name.Trim(),
            Email = normalizedEmail,
            Role = UserRoles.User
        };

        user.PasswordHash =
            _passwordHasher.HashPassword(
                user,
                dto.Password
            );

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponsedto?> LoginAsync(
        LoginDto dto
    )
    {
        var normalizedEmail =
            dto.Email.Trim().ToLower();

        var user =
            await _context.Users
                .FirstOrDefaultAsync(
                    u =>
                        u.Email.ToLower() ==
                        normalizedEmail
                );

        if (user == null)
        {
            return null;
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException(
                "This user account is inactive."
            );
        }

        var result =
            _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                dto.Password
            );

        if (
            result ==
            PasswordVerificationResult.Failed
        )
        {
            return null;
        }

        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponsedto> ChangePasswordAsync(
        int userId,
        ChangePasswordDto dto
    )
    {
        var user =
            await _context.Users
                .FirstOrDefaultAsync(
                    u => u.Id == userId
                );

        if (user == null)
        {
            throw new KeyNotFoundException(
                "Usuario no encontrado."
            );
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException(
                "La cuenta del usuario está inactiva."
            );
        }

        var currentPasswordResult =
            _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                dto.CurrentPassword
            );

        if (
            currentPasswordResult ==
            PasswordVerificationResult.Failed
        )
        {
            throw new ArgumentException(
                "La contraseña actual no es correcta."
            );
        }

        var samePasswordResult =
            _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                dto.NewPassword
            );

        if (
            samePasswordResult !=
            PasswordVerificationResult.Failed
        )
        {
            throw new ArgumentException(
                "La nueva contraseña debe ser diferente de la contraseña actual."
            );
        }

        user.PasswordHash =
            _passwordHasher.HashPassword(
                user,
                dto.NewPassword
            );

        // Invalida todos los tokens anteriores.
        user.TokenVersion++;

        await _context.SaveChangesAsync();

        // Devuelve un JWT nuevo con la nueva TokenVersion
        // para mantener activa la sesión actual.
        return GenerateAuthResponse(user);
    }

    private AuthResponsedto GenerateAuthResponse(
        User user
    )
    {
        var key =
            _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException(
                "JWT Key is missing."
            );

        var issuer =
            _configuration["Jwt:Issuer"];

        var audience =
            _configuration["Jwt:Audience"];

        var expirationMinutes =
            int.Parse(
                _configuration[
                    "Jwt:ExpirationMinutes"
                ] ?? "60"
            );

        var claims =
            new List<Claim>
            {
                new(
                    ClaimTypes.NameIdentifier,
                    user.Id.ToString()
                ),
                new(
                    ClaimTypes.Name,
                    user.Name
                ),
                new(
                    ClaimTypes.Email,
                    user.Email
                ),
                new(
                    ClaimTypes.Role,
                    user.Role
                ),
                new(
                    "token_version",
                    user.TokenVersion.ToString()
                )
            };

        var credentials =
            new SigningCredentials(
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(key)
                ),
                SecurityAlgorithms.HmacSha256
            );

        var token =
            new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires:
                    DateTime.UtcNow.AddMinutes(
                        expirationMinutes
                    ),
                signingCredentials:
                    credentials
            );

        return new AuthResponsedto
        {
            Token =
                new JwtSecurityTokenHandler()
                    .WriteToken(token),
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
        };
    }
}
