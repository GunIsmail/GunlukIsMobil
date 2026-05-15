using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GunlukIs.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddQuotaToJob : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ApplicantCount",
                table: "job_advertisements",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Quota",
                table: "job_advertisements",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApplicantCount",
                table: "job_advertisements");

            migrationBuilder.DropColumn(
                name: "Quota",
                table: "job_advertisements");
        }
    }
}
