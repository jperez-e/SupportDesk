using Microsoft.EntityFrameworkCore;
using SupportDesk.API.Data;
using SupportDesk.API.DTOs;
using SupportDesk.API.Models;

namespace SupportDesk.API.Services;

public class CategoryService : ICategoryService
{
    private readonly SupportDeskDbContext _context;

    public CategoryService(SupportDeskDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryResponseDto>> GetAllAsync()
    {
        return await _context.Categories
            .Select(category => new CategoryResponseDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description
            })
            .ToListAsync();
    }

    public async Task<CategoryResponseDto?> GetByIdAsync(int id)
    {
        return await _context.Categories
            .Where(category => category.Id == id)
            .Select(category => new CategoryResponseDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description
            })
            .FirstOrDefaultAsync();
    }

    public async Task<CategoryResponseDto> CreateAsync(
        CreateCategoryDto dto)
    {
        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description
        };

        _context.Categories.Add(category);

        await _context.SaveChangesAsync();

        return new CategoryResponseDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description
        };
    }

    public async Task<CategoryResponseDto?> UpdateAsync(
        int id,
        UpdateCategoryDto dto)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category == null)
        {
            return null;
        }

        category.Name = dto.Name;
        category.Description = dto.Description;

        await _context.SaveChangesAsync();

        return new CategoryResponseDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
        {
            return false;
        }

        var hasTickets = await _context.Tickets
            .IgnoreQueryFilters()
            .AnyAsync(t => t.CategoryId == id);

        if (hasTickets)
        {
            throw new ArgumentException(
                "No se puede eliminar la categoría porque tiene tickets asociados."
            );
        }

        _context.Categories.Remove(category);

        await _context.SaveChangesAsync();

        return true;
    }
}