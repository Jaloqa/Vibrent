using Serilog;

namespace Vibrent.Api.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication UseApi(this WebApplication app)
    {
        app.UseExceptionHandler();
        app.UseStatusCodePages();
        app.UseSerilogRequestLogging();

        app.UseAuthentication();
        app.UseAuthorization();

        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi().AllowAnonymous();
            app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "Vibrent API v1"));
        }

        app.MapHealthChecks("/health").AllowAnonymous();

        return app;
    }
}
