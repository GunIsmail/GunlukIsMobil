using FluentValidation;
using GunlukIs.Application.Features.Applications;
using GunlukIs.Application.Features.Chat;
using GunlukIs.Application.Features.Identity;
using GunlukIs.Application.Features.Jobs;
using GunlukIs.Application.Features.Ratings;
using Microsoft.Extensions.DependencyInjection;

namespace GunlukIs.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<IJobService, JobService>();
        services.AddScoped<IApplicationService, ApplicationService>();
        services.AddScoped<IChatService, ChatService>();
        services.AddScoped<IRatingService, RatingService>();
        return services;
    }
}
