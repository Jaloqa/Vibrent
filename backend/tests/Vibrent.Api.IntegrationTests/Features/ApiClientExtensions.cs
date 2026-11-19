using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Shouldly;
using Vibrent.Api.Features.Auth;
using Vibrent.Api.Features.Users;

namespace Vibrent.Api.IntegrationTests.Features;

internal static class ApiClientExtensions
{
    public const string DefaultPassword = "Sup3r-secret";

    public static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };

    public static string UniqueEmail() => $"{Guid.NewGuid():N}@vibrent.test";

    public static Task<HttpResponseMessage> RegisterAsync(this HttpClient client, string email, string password = DefaultPassword) =>
        client.PostAsJsonAsync("/auth/register", new { email, password, displayName = "Test user" });

    public static Task<HttpResponseMessage> LoginAsync(this HttpClient client, string email, string password) =>
        client.PostAsJsonAsync("/auth/login", new { email, password });

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

    public static async Task<Guid> GetMyIdAsync(this HttpClient client)
    {
        var profile = await client.GetFromJsonAsync<ProfileResponse>("/users/me");
        return profile.ShouldNotBeNull().Id;
    }

    public static async Task<T> ReadAsAsync<T>(this HttpResponseMessage response)
        where T : class
    {
        var body = await response.Content.ReadFromJsonAsync<T>(JsonOptions);
        return body.ShouldNotBeNull();
    }

    public static async Task<string?> ReadProblemCodeAsync(this HttpResponseMessage response)
    {
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        return problem.TryGetProperty("code", out var code) ? code.GetString() : null;
    }
}
