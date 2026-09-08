using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SupportDesk.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTicketHistoryFieldName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FieldName",
                table: "TicketHistories",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FieldName",
                table: "TicketHistories");
        }
    }
}
