using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Shouldly;
using Vibrent.Api.Features.Auth;

namespace Vibrent.Api.IntegrationTests.Features;

internal static class ApiClientExtensions
{
    public const string DefaultPassword = "Sup3r-secret";

    public static string UniqueEmail() => $"{Guid.NewGuid():N}@vibrent.test";

    public static Task<HttpResponseMessage> RegisterAsync(this HttpClient client, string email, string password = DefaultPassword) =>
        client.PostAsJsonAsync("/auth/register", new { email, password, displayName = "Test user" });

    public static async Task<string> RegisterAndGetTokenAsync(this HttpClient client, string? email = null)
    {
        using var response = await client.RegisterAsync(email ?? UniqueEmail());
        response.EnsureSuccessStatusCode();
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        return auth.ShouldNotBeNull().AccessToken;
    }

    public static HttpClient Authorize(this HttpClient client, string accessToken)
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        return client;
    }

    public static async Task<string?> ReadProblemCodeAsync(this HttpResponseMessage response)
    {
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        return problem.TryGetProperty("code", out var code) ? code.GetString() : null;
    }
}
