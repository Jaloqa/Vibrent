using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Vibrent.Api.Features.Auth;

namespace Vibrent.Api.IntegrationTests.Features.Admin;

internal static class AdminTestData
{
    public static async Task<HttpClient> SignedInAdminAsync(this ApiFactory factory)
    {
        var client = factory.CreateClient();
        var email = ApiClientExtensions.UniqueEmail();
        (await client.RegisterAsync(email)).EnsureSuccessStatusCode();

        await using (var dbContext = factory.CreateDbContext())
        {
            var user = await dbContext.Users.SingleAsync(candidate => candidate.Email == email);
            user.PromoteToAdmin();
            await dbContext.SaveChangesAsync();
        }

        using var login = await client.LoginAsync(email, ApiClientExtensions.DefaultPassword);
        login.EnsureSuccessStatusCode();
        var auth = (await login.Content.ReadFromJsonAsync<AuthResponse>()).ShouldNotBeNull();

        return client.Authorize(auth.AccessToken);
    }
}
