using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SupportDesk.API.DTOs;
using SupportDesk.API.Services;
using Microsoft.AspNetCore.Authorization;
using SupportDesk.API.Constants;

namespace SupportDesk.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(
        ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _categoryService.GetAllAsync();

        return Ok(categories);
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategory(int id)
    {
        var category =
            await _categoryService.GetByIdAsync(id);

        if (category == null)
        {
            return NotFound();
        }

        return Ok(category);
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpPost]
    public async Task<IActionResult> CreateCategory(
     CreateCategoryDto dto)
    {
        var category =
            await _categoryService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetCategory),
            new { id = category.Id },
            category);
    }
    [Authorize(Roles = UserRoles.Admin)]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(
        int id,
        UpdateCategoryDto dto)
    {
        var category =
            await _categoryService.UpdateAsync(id, dto);

        if (category == null)
        {
            return NotFound();
        }

        return Ok(category);
    }

    [Authorize(Roles = UserRoles.Admin)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var deleted =
            await _categoryService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

}
