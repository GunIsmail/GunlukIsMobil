using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GunlukIs.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRatingSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "employer_ratings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployerId = table.Column<Guid>(type: "uuid", nullable: false),
                    RaterId = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkingConditions = table.Column<int>(type: "integer", nullable: false),
                    PaymentReliability = table.Column<int>(type: "integer", nullable: false),
                    ManagementStyle = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employer_ratings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_employer_ratings_applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_employer_ratings_users_EmployerId",
                        column: x => x.EmployerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_employer_ratings_users_RaterId",
                        column: x => x.RaterId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "worker_ratings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkerId = table.Column<Guid>(type: "uuid", nullable: false),
                    RaterId = table.Column<Guid>(type: "uuid", nullable: false),
                    Communication = table.Column<int>(type: "integer", nullable: false),
                    ServiceSpeed = table.Column<int>(type: "integer", nullable: false),
                    Teamwork = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_worker_ratings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_worker_ratings_applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_worker_ratings_users_RaterId",
                        column: x => x.RaterId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_worker_ratings_users_WorkerId",
                        column: x => x.WorkerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_employer_ratings_ApplicationId",
                table: "employer_ratings",
                column: "ApplicationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_employer_ratings_EmployerId",
                table: "employer_ratings",
                column: "EmployerId");

            migrationBuilder.CreateIndex(
                name: "IX_employer_ratings_RaterId",
                table: "employer_ratings",
                column: "RaterId");

            migrationBuilder.CreateIndex(
                name: "IX_worker_ratings_ApplicationId",
                table: "worker_ratings",
                column: "ApplicationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_worker_ratings_RaterId",
                table: "worker_ratings",
                column: "RaterId");

            migrationBuilder.CreateIndex(
                name: "IX_worker_ratings_WorkerId",
                table: "worker_ratings",
                column: "WorkerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "employer_ratings");

            migrationBuilder.DropTable(
                name: "worker_ratings");
        }
    }
}
