using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Shouldly;
using Vibrent.Api.Features.Auth;

namespace Vibrent.Api.IntegrationTests.Features.Auth;

[Collection(ApiFixtureDefinition.Name)]
public sealed class RegisterTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_ReturnCreatedWithToken_When_DataIsValid()
    {
        using var client = factory.CreateClient();

        using var response = await client.RegisterAsync(ApiClientExtensions.UniqueEmail());

        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var auth = (await response.Content.ReadFromJsonAsync<AuthResponse>()).ShouldNotBeNull();
        auth.AccessToken.ShouldNotBeNullOrWhiteSpace();
        auth.ExpiresAt.ShouldBeGreaterThan(DateTimeOffset.UtcNow);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_EmailIsTakenIgnoringCase()
    {
        using var client = factory.CreateClient();
        var email = ApiClientExtensions.UniqueEmail();
        (await client.RegisterAsync(email)).EnsureSuccessStatusCode();

        using var response = await client.RegisterAsync(email.ToUpperInvariant());

        response.StatusCode.ShouldBe(HttpStatusCode.Conflict);
        (await response.ReadProblemCodeAsync()).ShouldBe("Auth.EmailTaken");
    }

    [Fact]
    public async Task Should_ReturnValidationProblem_When_EmailAndPasswordAreInvalid()
    {
        using var client = factory.CreateClient();

        using var response = await client.RegisterAsync("not-an-email", "short");

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        var errors = problem.GetProperty("errors");
        errors.TryGetProperty("Email", out _).ShouldBeTrue();
        errors.TryGetProperty("Password", out _).ShouldBeTrue();
    }
}
