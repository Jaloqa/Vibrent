using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Shouldly;
using Vibrent.Api.Features.Users;

namespace Vibrent.Api.IntegrationTests.Features.Users;

[Collection(ApiFixtureDefinition.Name)]
public sealed class UpdateProfileTests(ApiFactory factory)
{
    [Fact]
    public async Task Should_SaveProfile_When_DataIsValid()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());

        using var response = await client.PutAsJsonAsync(
            "/users/me",
            new { displayName = "  Ola  ", bio = "Board games and climbing", city = "Opole" });

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var profile = (await client.GetFromJsonAsync<ProfileResponse>("/users/me")).ShouldNotBeNull();
        profile.DisplayName.ShouldBe("Ola");
        profile.Bio.ShouldBe("Board games and climbing");
        profile.City.ShouldBe("Opole");
    }

    [Fact]
    public async Task Should_ClearOptionalFields_When_TheyAreBlank()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());
        (await client.PutAsJsonAsync("/users/me", new { displayName = "Ola", bio = "Bio", city = "Opole" })).EnsureSuccessStatusCode();

        using var response = await client.PutAsJsonAsync("/users/me", new { displayName = "Ola", bio = " ", city = (string?)null });

        var profile = (await response.Content.ReadFromJsonAsync<ProfileResponse>()).ShouldNotBeNull();
        profile.Bio.ShouldBeNull();
        profile.City.ShouldBeNull();
    }

    [Fact]
    public async Task Should_ReturnValidationProblem_When_DisplayNameIsEmpty()
    {
        using var client = factory.CreateClient();
        client.Authorize(await client.RegisterAndGetTokenAsync());

        using var response = await client.PutAsJsonAsync("/users/me", new { displayName = "", bio = (string?)null, city = (string?)null });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        (await response.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("errors").TryGetProperty("DisplayName", out _).ShouldBeTrue();
    }
}
